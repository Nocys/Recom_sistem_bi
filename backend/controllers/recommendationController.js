const contentBasedService = require('../services/contentBasedService');
const hybridRecommendationService = require('../services/hybridRecommendationService');
const roomComplementaryService = require('../services/roomComplementaryService');
const userBasedService = require('../services/userBasedService');
const { sendError, sendSuccess } = require('../utils/response');

const getAuthenticatedUser = (req) => {
  return req.user || (req.session ? req.session.user : null);
};

const recommendationHealth = (req, res) => {
  return sendSuccess(
    res,
    'Recommendation controller is ready. Content-Based, User-Based, and Hybrid recommendations are available.'
  );
};

const getContentBasedRecommendations = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await contentBasedService.getContentBasedRecommendations(
      user.id,
      req.query.limit
    );
    const message = result.meta.fallback_used
      ? 'User interaction data is not sufficient. Fallback products returned.'
      : 'Content-based recommendations retrieved successfully';

    return sendSuccess(res, message, {
      algorithm: 'content-based-filtering',
      recommendations: result.recommendations,
      meta: result.meta
    });
  } catch (error) {
    return next(error);
  }
};

const getUserBasedRecommendations = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await userBasedService.getUserBasedRecommendations(
      user.id,
      req.query.limit
    );
    const message = result.meta.fallback_used
      ? 'User collaborative data is not sufficient. Fallback products returned.'
      : 'User-based recommendations retrieved successfully';

    return sendSuccess(res, message, {
      algorithm: 'user-based-collaborative-filtering',
      recommendations: result.recommendations,
      meta: result.meta
    });
  } catch (error) {
    return next(error);
  }
};

const getHybridRecommendations = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await hybridRecommendationService.getHybridRecommendations(
      user.id,
      req.query.limit
    );

    return sendSuccess(res, 'Hybrid recommendations retrieved successfully', {
      algorithm: 'hybrid-recommendation',
      recommendations: result.recommendations,
      meta: result.meta
    });
  } catch (error) {
    return next(error);
  }
};

const getPersonalRecommendations = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await hybridRecommendationService.getPersonalRecommendations(
      user.id,
      req.query.limit
    );

    return sendSuccess(res, 'Personal recommendations retrieved successfully', {
      algorithm: 'hybrid-recommendation',
      recommendations: result.recommendations,
      meta: result.meta
    });
  } catch (error) {
    return next(error);
  }
};

const getColdStartRecommendations = async (req, res, next) => {
  try {
    const result = await hybridRecommendationService.getColdStartRecommendations(
      req.query.limit
    );

    return sendSuccess(res, 'Cold-start recommendations retrieved successfully', {
      algorithm: 'cold-start',
      recommendations: result.recommendations,
      meta: result.meta
    });
  } catch (error) {
    return next(error);
  }
};

const getRoomComplementaryRecommendations = async (req, res, next) => {
  try {
    const result = await roomComplementaryService.getRoomComplementaryRecommendations(
      req.params.productId,
      {
        limit: req.query.limit
      }
    );

    if (result.notFound) {
      return sendError(res, 'Product not found', 404);
    }

    const hasRule = result.rule && result.rule.complementary_categories.length > 0;
    const message = hasRule
      ? 'Room complementary recommendations retrieved successfully'
      : 'No room complementary rule found';

    return sendSuccess(res, message, result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  recommendationHealth,
  getContentBasedRecommendations,
  getUserBasedRecommendations,
  getHybridRecommendations,
  getPersonalRecommendations,
  getColdStartRecommendations,
  getRoomComplementaryRecommendations
};

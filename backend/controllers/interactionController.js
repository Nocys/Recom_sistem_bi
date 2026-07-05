const env = require('../config/env');
const interactionService = require('../services/interactionService');
const { INTERACTION_WEIGHTS } = require('../utils/constants');
const { sendError, sendSuccess } = require('../utils/response');

const INTERACTION_TYPES = Object.keys(INTERACTION_WEIGHTS);

const getAuthenticatedUser = (req) => {
  return req.user || (req.session ? req.session.user : null);
};

const parsePagination = ({ limit, offset }) => {
  const parsedLimit = Number.parseInt(limit, 10);
  const parsedOffset = Number.parseInt(offset, 10);

  return {
    limit:
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 20,
    offset:
      Number.isInteger(parsedOffset) && parsedOffset >= 0
        ? parsedOffset
        : 0
  };
};

const parsePagePagination = ({ page, limit }) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  return {
    page:
      Number.isInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : 1,
    limit:
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 24)
        : 12
  };
};

const normalizeInteractionType = (interactionType) => {
  if (interactionType === undefined || interactionType === null) {
    return null;
  }

  const normalized = String(interactionType).trim();

  return normalized.length > 0 ? normalized : null;
};

const buildPaginationResponse = (result) => {
  return {
    limit: result.limit,
    offset: result.offset,
    total: result.total
  };
};

const buildWhatsappUrl = (product) => {
  if (!env.WHATSAPP_ADMIN_NUMBER || !product) {
    return null;
  }

  const message = `Saya tertarik dengan produk ${product.name}`;

  return `https://wa.me/${env.WHATSAPP_ADMIN_NUMBER}?text=${encodeURIComponent(message)}`;
};

const formatRating = (rating) => {
  return rating
    ? {
        implicit_rating: rating.implicit_rating,
        interaction_count: rating.interaction_count,
        last_interaction_at: rating.last_interaction_at
      }
    : null;
};

const interactionHealth = (req, res) => {
  return sendSuccess(
    res,
    'Interaction controller is ready. Interaction logging and implicit rating endpoints are available in Bagian 6.'
  );
};

const logInteraction = (interactionType, successMessage) => {
  return async (req, res, next) => {
    try {
      const user = getAuthenticatedUser(req);

      if (!user) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await interactionService.createInteraction(
        user.id,
        req.body.product_id,
        interactionType
      );

      if (!result.product) {
        return sendError(res, 'Product not found or inactive.', 404);
      }

      const data = {
        interaction: result.interaction,
        product: result.product,
        rating: result.rating
          ? {
              implicit_rating: result.rating.implicit_rating,
              interaction_count: result.rating.interaction_count,
              last_interaction_at: result.rating.last_interaction_at
            }
          : null
      };

      if (interactionType === 'whatsapp_inquiry') {
        data.whatsapp_url = buildWhatsappUrl(result.product);
      }

      return sendSuccess(res, successMessage, data);
    } catch (error) {
      return next(error);
    }
  };
};

const logPageView = logInteraction('page_view', 'Page view logged successfully');
const logWhatsappInquiry = logInteraction(
  'whatsapp_inquiry',
  'WhatsApp inquiry logged successfully'
);

const getProductInteractionState = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await interactionService.getProductInteractionState(
      user.id,
      req.params.productId
    );

    if (!result.product) {
      return sendError(res, 'Product not found or inactive.', 404);
    }

    return sendSuccess(
      res,
      'Product interaction state retrieved successfully',
      result.state
    );
  } catch (error) {
    return next(error);
  }
};

const likeProduct = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await interactionService.likeProduct(user.id, req.body.product_id);

    if (!result.product) {
      return sendError(res, 'Product not found or inactive.', 404);
    }

    return sendSuccess(res, 'Product liked successfully', {
      ...result.state,
      rating: formatRating(result.rating)
    });
  } catch (error) {
    return next(error);
  }
};

const unlikeProduct = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await interactionService.unlikeProduct(
      user.id,
      req.params.productId
    );

    if (!result.product) {
      return sendError(res, 'Product not found or inactive.', 404);
    }

    return sendSuccess(res, 'Product unliked successfully', {
      liked: false,
      wishlisted: result.state.wishlisted,
      product_id: result.state.product_id
    });
  } catch (error) {
    return next(error);
  }
};

const wishlistProduct = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await interactionService.wishlistProduct(
      user.id,
      req.body.product_id
    );

    if (!result.product) {
      return sendError(res, 'Product not found or inactive.', 404);
    }

    return sendSuccess(res, 'Product added to wishlist successfully', {
      ...result.state,
      rating: formatRating(result.rating)
    });
  } catch (error) {
    return next(error);
  }
};

const unwishlistProduct = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await interactionService.unwishlistProduct(
      user.id,
      req.params.productId
    );

    if (!result.product) {
      return sendError(res, 'Product not found or inactive.', 404);
    }

    return sendSuccess(res, 'Product removed from wishlist successfully', {
      liked: result.state.liked,
      wishlisted: false,
      product_id: result.state.product_id
    });
  } catch (error) {
    return next(error);
  }
};

const getMyHistory = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const interactionType = normalizeInteractionType(req.query.interaction_type);

    if (interactionType && !INTERACTION_TYPES.includes(interactionType)) {
      return sendError(res, 'Invalid interaction type.', 400, {
        field: 'interaction_type',
        allowedValues: INTERACTION_TYPES
      });
    }

    const result = await interactionService.getUserInteractionHistory(user.id, {
      interaction_type: interactionType,
      ...parsePagination(req.query)
    });

    return sendSuccess(res, 'Interaction history retrieved successfully', {
      interactions: result.interactions,
      pagination: buildPaginationResponse(result)
    });
  } catch (error) {
    return next(error);
  }
};

const getMyRatings = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const ratings = await interactionService.getUserRatings(user.id);

    return sendSuccess(res, 'User ratings retrieved successfully', {
      ratings
    });
  } catch (error) {
    return next(error);
  }
};

const getMyLikedProducts = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await interactionService.getMyLikedProducts(
      user.id,
      parsePagePagination(req.query)
    );

    return sendSuccess(res, 'Liked products retrieved successfully', result);
  } catch (error) {
    return next(error);
  }
};

const getMyWishlistProducts = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const result = await interactionService.getMyWishlistProducts(
      user.id,
      parsePagePagination(req.query)
    );

    return sendSuccess(res, 'Wishlist products retrieved successfully', result);
  } catch (error) {
    return next(error);
  }
};

const getMySummary = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    const summary = await interactionService.getUserInteractionSummary(user.id);

    return sendSuccess(res, 'User interaction summary retrieved successfully', {
      summary
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  interactionHealth,
  logPageView,
  logLike: likeProduct,
  logFavorite: wishlistProduct,
  getProductInteractionState,
  likeProduct,
  unlikeProduct,
  wishlistProduct,
  unwishlistProduct,
  logWhatsappInquiry,
  getMyHistory,
  getMyRatings,
  getMyLikedProducts,
  getMyWishlistProducts,
  getMySummary
};

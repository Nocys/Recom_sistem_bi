const { query } = require('../config/db');
const { cosineSimilarity } = require('../utils/math');
const {
  CF_EXCLUDED_INTERACTIONS,
  IMPLICIT_PREFERENCE_WEIGHTS,
  MAX_IMPLICIT_PREFERENCE_SCORE
} = require('../utils/constants');

const DEFAULT_RECOMMENDATION_LIMIT = 10;
const MAX_RECOMMENDATION_LIMIT = 10;
const MIN_RECOMMENDATION_LIMIT = 5;
const DEFAULT_SIMILAR_USER_LIMIT = 5;

const PRODUCT_SELECT_FIELDS = `
  id,
  name,
  image_url,
  category,
  material,
  style_theme,
  dominant_color,
  room_category,
  description,
  price,
  stock,
  status,
  created_at,
  updated_at
`;

const normalizeLimit = (limit) => {
  const parsedLimit = Number.parseInt(limit, 10);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_RECOMMENDATION_LIMIT;
  }

  return Math.max(
    MIN_RECOMMENDATION_LIMIT,
    Math.min(parsedLimit, MAX_RECOMMENDATION_LIMIT)
  );
};

const normalizeOptions = (options) => {
  if (options && typeof options === 'object') {
    return {
      limit: normalizeLimit(options.limit),
      similarUserLimit: normalizeLimit(
        options.similarUserLimit || DEFAULT_SIMILAR_USER_LIMIT
      )
    };
  }

  return {
    limit: normalizeLimit(options),
    similarUserLimit: DEFAULT_SIMILAR_USER_LIMIT
  };
};

const roundScore = (score) => {
  const numericScore = Number(score);

  return Number((Number.isFinite(numericScore) ? numericScore : 0).toFixed(6));
};

const buildScoringMeta = () => {
  return {
    scoring_method: 'implicit_preference_score',
    scoring_weights: {
      like: IMPLICIT_PREFERENCE_WEIGHTS.LIKE,
      wishlist: IMPLICIT_PREFERENCE_WEIGHTS.WISHLIST,
      whatsapp_inquiry: IMPLICIT_PREFERENCE_WEIGHTS.WHATSAPP_INQUIRY
    },
    max_implicit_preference_score: MAX_IMPLICIT_PREFERENCE_SCORE,
    cf_score_normalized: true,
    page_view_used_for_cf: false,
    excluded_interactions: CF_EXCLUDED_INTERACTIONS
  };
};

const toBinaryPreferenceFlag = (value) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0 ? 1 : 0;
};

const calculateImplicitPreferenceScore = ({
  active_like = 0,
  active_wishlist = 0,
  has_whatsapp_inquiry = 0
} = {}) => {
  const score =
    IMPLICIT_PREFERENCE_WEIGHTS.LIKE * toBinaryPreferenceFlag(active_like) +
    IMPLICIT_PREFERENCE_WEIGHTS.WISHLIST * toBinaryPreferenceFlag(active_wishlist) +
    IMPLICIT_PREFERENCE_WEIGHTS.WHATSAPP_INQUIRY *
      toBinaryPreferenceFlag(has_whatsapp_inquiry);

  return Math.min(score, MAX_IMPLICIT_PREFERENCE_SCORE);
};

const mapRecommendationProduct = (
  product,
  {
    cfScore = 0,
    predictedPreferenceScore = 0,
    recommendationSource = 'user_based_cf'
  } = {}
) => {
  const normalizedCfScore = roundScore(cfScore);

  return {
    id: product.id,
    name: product.name,
    image_url: product.image_url,
    category: product.category,
    material: product.material,
    style_theme: product.style_theme,
    dominant_color: product.dominant_color,
    room_category: product.room_category,
    description: product.description,
    price: product.price,
    stock: product.stock,
    status: product.status,
    score: normalizedCfScore,
    cf_score: normalizedCfScore,
    predicted_preference_score: roundScore(predictedPreferenceScore),
    recommendation_source: recommendationSource
  };
};

const getAllUserProductPreferenceScores = async () => {
  const result = await query(
    `
      SELECT
        user_id,
        product_id,
        active_like,
        active_wishlist,
        has_whatsapp_inquiry,
        implicit_score,
        normalized_score
      FROM user_product_preference_scores
      ORDER BY user_id, product_id
    `
  );

  return result.rows.map((preference) => ({
    ...preference,
    user_id: String(preference.user_id),
    product_id: String(preference.product_id),
    active_like: Number(preference.active_like),
    active_wishlist: Number(preference.active_wishlist),
    has_whatsapp_inquiry: Number(preference.has_whatsapp_inquiry),
    implicit_score: Number(preference.implicit_score),
    normalized_score: Number(preference.normalized_score)
  }));
};

const getAllUserProductRatings = async () => {
  const preferenceScores = await getAllUserProductPreferenceScores();

  return preferenceScores.map((preference) => ({
    ...preference,
    implicit_rating: preference.implicit_score,
    interaction_count:
      preference.active_like +
      preference.active_wishlist +
      preference.has_whatsapp_inquiry,
    last_interaction_at: null
  }));
};

const getActiveProductsMap = async () => {
  const result = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE status = 'active'
    `
  );

  return new Map(
    result.rows.map((product) => {
      return [String(product.id), product];
    })
  );
};

const buildProductVocabulary = (preferenceRows = []) => {
  const productIds = new Set();

  const safePreferenceRows = Array.isArray(preferenceRows)
    ? preferenceRows
    : [];

  safePreferenceRows.forEach((preference) => {
    if (preference && preference.product_id) {
      productIds.add(String(preference.product_id));
    }
  });

  return Array.from(productIds).sort();
};

const buildUserProductMatrix = (preferenceRows = []) => {
  const safePreferenceRows = Array.isArray(preferenceRows)
    ? preferenceRows
    : [];

  return safePreferenceRows.reduce((matrix, preference) => {
    const implicitScore = Number(preference.implicit_score);

    if (!Number.isFinite(implicitScore) || implicitScore <= 0) {
      return matrix;
    }

    const userId = String(preference.user_id);
    const productId = String(preference.product_id);

    if (!matrix[userId]) {
      matrix[userId] = {};
    }

    matrix[userId][productId] = implicitScore;

    return matrix;
  }, {});
};

const buildUserVector = (userId, productVocabulary = [], matrix = {}) => {
  const userPreferences = matrix[String(userId)] || {};

  return productVocabulary.map((productId) => {
    const preferenceScore = Number(userPreferences[productId]);

    return Number.isFinite(preferenceScore) ? preferenceScore : 0;
  });
};

const calculateUserSimilarities = (
  targetUserId,
  matrix = {},
  productVocabulary = []
) => {
  const normalizedTargetUserId = String(targetUserId);
  const targetUserVector = buildUserVector(
    normalizedTargetUserId,
    productVocabulary,
    matrix
  );

  return Object.keys(matrix)
    .filter((userId) => userId !== normalizedTargetUserId)
    .map((userId) => {
      const otherUserVector = buildUserVector(userId, productVocabulary, matrix);

      return {
        user_id: userId,
        similarity: cosineSimilarity(targetUserVector, otherUserVector)
      };
    })
    .filter((item) => item.similarity > 0)
    .sort((itemA, itemB) => itemB.similarity - itemA.similarity);
};

const getTopSimilarUsers = (
  similarities = [],
  limit = DEFAULT_SIMILAR_USER_LIMIT
) => {
  const parsedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? parsedLimit
    : DEFAULT_SIMILAR_USER_LIMIT;

  return Array.isArray(similarities) ? similarities.slice(0, safeLimit) : [];
};

const getCandidateProducts = (targetUserId, similarUsers = [], matrix = {}) => {
  const targetUserPreferences = matrix[String(targetUserId)] || {};
  const candidateProductIds = new Set();

  const safeSimilarUsers = Array.isArray(similarUsers) ? similarUsers : [];

  safeSimilarUsers.forEach((similarUser) => {
    const similarUserPreferences = matrix[similarUser.user_id] || {};

    Object.entries(similarUserPreferences).forEach(([productId, score]) => {
      const preferenceScore = Number(score);

      if (!Number.isFinite(preferenceScore) || preferenceScore <= 0) {
        return;
      }

      if (targetUserPreferences[productId]) {
        return;
      }

      candidateProductIds.add(productId);
    });
  });

  return Array.from(candidateProductIds).sort();
};

const calculateCandidateScore = (
  candidateProductId,
  similarUsers = [],
  matrix = {}
) => {
  let weightedScoreSum = 0;
  let similaritySum = 0;

  const safeSimilarUsers = Array.isArray(similarUsers) ? similarUsers : [];

  safeSimilarUsers.forEach((similarUser) => {
    const similarity = Number(similarUser.similarity);
    const similarUserPreferences = matrix[similarUser.user_id] || {};
    const preferenceScore = Number(similarUserPreferences[String(candidateProductId)]);

    if (
      !Number.isFinite(similarity) ||
      similarity <= 0 ||
      !Number.isFinite(preferenceScore) ||
      preferenceScore <= 0
    ) {
      return;
    }

    weightedScoreSum += similarity * preferenceScore;
    similaritySum += similarity;
  });

  if (similaritySum === 0) {
    return 0;
  }

  return weightedScoreSum / similaritySum;
};

const normalizeCFScore = (score) => {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore) || numericScore <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, numericScore / MAX_IMPLICIT_PREFERENCE_SCORE)
  );
};

const calculateCandidateScores = (
  targetUserId,
  similarUsers = [],
  matrix = {},
  activeProductsMap
) => {
  return getCandidateProducts(targetUserId, similarUsers, matrix)
    .map((productId) => {
      const predictedPreferenceScore = calculateCandidateScore(
        productId,
        similarUsers,
        matrix
      );
      const cfScore = normalizeCFScore(predictedPreferenceScore);

      return {
        product_id: productId,
        product: activeProductsMap ? activeProductsMap.get(productId) : null,
        predicted_preference_score: predictedPreferenceScore,
        cf_score: cfScore,
        score: cfScore
      };
    })
    .filter((item) => item.cf_score > 0);
};

const generateUserBasedRecommendationsFromRows = (
  targetUserId,
  preferenceRows = [],
  options = {}
) => {
  const limit = normalizeLimit(options.limit);
  const similarUserLimit = options.similarUserLimit || DEFAULT_SIMILAR_USER_LIMIT;
  const productVocabulary = buildProductVocabulary(preferenceRows);
  const matrix = buildUserProductMatrix(preferenceRows);
  const similarities = calculateUserSimilarities(
    targetUserId,
    matrix,
    productVocabulary
  );
  const topSimilarUsers = getTopSimilarUsers(similarities, similarUserLimit);

  return calculateCandidateScores(targetUserId, topSimilarUsers, matrix)
    .sort((itemA, itemB) => {
      if (itemB.cf_score !== itemA.cf_score) {
        return itemB.cf_score - itemA.cf_score;
      }

      return String(itemA.product_id).localeCompare(String(itemB.product_id));
    })
    .slice(0, limit)
    .map((item) => ({
      product_id: item.product_id,
      predicted_preference_score: roundScore(item.predicted_preference_score),
      cf_score: roundScore(item.cf_score),
      score: roundScore(item.cf_score),
      recommendation_source: 'user_based_cf'
    }));
};

const getFallbackProducts = async (limit) => {
  const popularResult = await query(
    `
      SELECT *
      FROM popular_products
      ORDER BY popularity_score DESC, total_interactions DESC
      LIMIT $1
    `,
    [limit]
  );

  if (popularResult.rows.length > 0) {
    return popularResult.rows.map((product) => {
      return mapRecommendationProduct(product, {
        recommendationSource: 'fallback'
      });
    });
  }

  const randomResult = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE status = 'active'
      ORDER BY RANDOM()
      LIMIT $1
    `,
    [limit]
  );

  return randomResult.rows.map((product) => {
    return mapRecommendationProduct(product, {
      recommendationSource: 'fallback'
    });
  });
};

const filterFallbackProducts = (
  products,
  excludedProductIds,
  existingProductIds
) => {
  return products.filter((product) => {
    const productId = String(product.id);

    return (
      !excludedProductIds.has(productId) &&
      !existingProductIds.has(productId)
    );
  });
};

const buildFallbackResponse = async ({
  userId,
  limit,
  reason,
  preferenceCount,
  excludedProductIds = new Set(),
  similarUserCount = 0
}) => {
  const fallbackProducts = await getFallbackProducts(limit * 2);
  const filteredFallback = filterFallbackProducts(
    fallbackProducts,
    excludedProductIds,
    new Set()
  ).slice(0, limit);

  return {
    recommendations: filteredFallback,
    meta: {
      algorithm: 'user-based-collaborative-filtering',
      user_id: userId,
      limit,
      fallback_used: true,
      reason,
      similar_user_count: similarUserCount,
      preference_count: preferenceCount,
      rating_count: preferenceCount,
      total_candidates: filteredFallback.length,
      ...buildScoringMeta()
    }
  };
};

const appendFallbackRecommendations = async ({
  recommendations,
  excludedProductIds,
  limit
}) => {
  if (recommendations.length >= limit) {
    return [];
  }

  const existingProductIds = new Set(
    recommendations.map((recommendation) => String(recommendation.id))
  );
  const fallbackProducts = await getFallbackProducts(limit * 2);

  return filterFallbackProducts(
    fallbackProducts,
    excludedProductIds,
    existingProductIds
  ).slice(0, limit - recommendations.length);
};

const getUserBasedRecommendations = async (userId, options = {}) => {
  const { limit, similarUserLimit } = normalizeOptions(options);
  const preferenceRows = await getAllUserProductPreferenceScores();

  if (preferenceRows.length === 0) {
    return buildFallbackResponse({
      userId,
      limit,
      reason: 'No implicit preference score data available',
      preferenceCount: 0
    });
  }

  const productVocabulary = buildProductVocabulary(preferenceRows);
  const matrix = buildUserProductMatrix(preferenceRows);
  const normalizedUserId = String(userId);
  const excludedProductIds = new Set(Object.keys(matrix[normalizedUserId] || {}));

  if (!matrix[normalizedUserId]) {
    return buildFallbackResponse({
      userId,
      limit,
      reason: 'Active user has no implicit preference score data',
      preferenceCount: preferenceRows.length
    });
  }

  const activeProductsMap = await getActiveProductsMap();
  const similarities = calculateUserSimilarities(
    normalizedUserId,
    matrix,
    productVocabulary
  );

  if (similarities.length === 0) {
    return buildFallbackResponse({
      userId,
      limit,
      reason: 'No similar users available',
      preferenceCount: preferenceRows.length,
      excludedProductIds
    });
  }

  const topSimilarUsers = getTopSimilarUsers(similarities, similarUserLimit);
  const candidateScores = calculateCandidateScores(
    normalizedUserId,
    topSimilarUsers,
    matrix,
    activeProductsMap
  );
  const sortedCandidates = candidateScores
    .filter((item) => item.product)
    .sort((itemA, itemB) => {
      if (itemB.cf_score !== itemA.cf_score) {
        return itemB.cf_score - itemA.cf_score;
      }

      return itemA.product.name.localeCompare(itemB.product.name);
    })
    .map((item) => {
      return mapRecommendationProduct(item.product, {
        cfScore: item.cf_score,
        predictedPreferenceScore: item.predicted_preference_score
      });
    });
  const recommendations = sortedCandidates.slice(0, limit);
  const fallbackRecommendations = await appendFallbackRecommendations({
    recommendations,
    excludedProductIds,
    limit
  });
  const finalRecommendations = [
    ...recommendations,
    ...fallbackRecommendations
  ].slice(0, limit);
  const fallbackUsed =
    fallbackRecommendations.length > 0 ||
    finalRecommendations.length < limit;
  let reason = null;

  if (fallbackRecommendations.length > 0) {
    reason = 'Not enough collaborative candidates available';
  } else if (candidateScores.length === 0) {
    reason = 'No candidate products available';
  } else if (finalRecommendations.length < limit) {
    reason = 'Not enough recommended products available';
  }

  return {
    recommendations: finalRecommendations,
    meta: {
      algorithm: 'user-based-collaborative-filtering',
      user_id: userId,
      limit,
      fallback_used: fallbackUsed,
      reason,
      similar_user_count: topSimilarUsers.length,
      preference_count: preferenceRows.length,
      rating_count: preferenceRows.length,
      total_candidates: candidateScores.length,
      ...buildScoringMeta()
    }
  };
};

module.exports = {
  normalizeLimit,
  normalizeOptions,
  buildScoringMeta,
  calculateImplicitPreferenceScore,
  getAllUserProductPreferenceScores,
  getActiveProductsMap,
  buildUserProductMatrix,
  buildProductVocabulary,
  buildUserVector,
  calculateUserSimilarities,
  getTopSimilarUsers,
  getCandidateProducts,
  calculateCandidateScore,
  calculateCandidateScores,
  normalizeCFScore,
  generateUserBasedRecommendationsFromRows,
  getFallbackProducts,
  getUserBasedRecommendations,
  getAllUserProductRatings
};

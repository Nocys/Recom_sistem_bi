const { query } = require('../config/db');
const {
  PRODUCT_STATUS,
  ROOM_COMPLEMENTARY_RULES
} = require('../utils/constants');

const DEFAULT_RECOMMENDATION_LIMIT = 6;
const MAX_RECOMMENDATION_LIMIT = 6;
const MIN_RECOMMENDATION_LIMIT = 1;

const PRODUCT_SELECT_FIELDS = `
  id,
  name,
  image_url,
  category,
  material,
  material_variant,
  style_theme,
  dominant_color,
  room_category,
  price,
  stock,
  status,
  created_at,
  updated_at
`;

const normalizeComparable = (value) => {
  return String(value || '').trim().toLowerCase();
};

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

const getComplementaryCategoriesForRoom = (roomCategory) => {
  const normalizedRoom = normalizeComparable(roomCategory);
  const roomRule = Object.entries(ROOM_COMPLEMENTARY_RULES).find(([room]) => {
    return normalizeComparable(room) === normalizedRoom;
  });

  return roomRule ? [...roomRule[1]] : [];
};

const calculateRoomMatch = (currentProduct, candidateProduct) => {
  return normalizeComparable(currentProduct.room_category) ===
    normalizeComparable(candidateProduct.room_category)
    ? 1
    : 0;
};

const calculateComplementaryCategoryMatch = (currentProduct, candidateProduct) => {
  const complementaryCategories = getComplementaryCategoriesForRoom(
    currentProduct.room_category
  );
  const candidateCategory = normalizeComparable(candidateProduct.category);

  return complementaryCategories.some((category) => {
    return normalizeComparable(category) === candidateCategory;
  })
    ? 1
    : 0;
};

const calculateStyleMatch = (currentProduct, candidateProduct) => {
  return normalizeComparable(currentProduct.style_theme) ===
    normalizeComparable(candidateProduct.style_theme)
    ? 1
    : 0;
};

const calculateColorMatch = (currentProduct, candidateProduct) => {
  return normalizeComparable(currentProduct.dominant_color) ===
    normalizeComparable(candidateProduct.dominant_color)
    ? 1
    : 0;
};

const calculateComplementaryScore = (currentProduct, candidateProduct) => {
  const roomMatch = calculateRoomMatch(currentProduct, candidateProduct);
  const categoryMatch = calculateComplementaryCategoryMatch(
    currentProduct,
    candidateProduct
  );
  const styleMatch = calculateStyleMatch(currentProduct, candidateProduct);
  const colorMatch = calculateColorMatch(currentProduct, candidateProduct);
  const score =
    0.45 * roomMatch +
    0.35 * categoryMatch +
    0.15 * styleMatch +
    0.05 * colorMatch;

  return Number(score.toFixed(6));
};

const hasDifferentCategory = (currentProduct, candidateProduct) => {
  return normalizeComparable(currentProduct.category) !==
    normalizeComparable(candidateProduct.category);
};

const getCreatedAtTimestamp = (product) => {
  const timestamp = product && product.created_at
    ? new Date(product.created_at).getTime()
    : 0;

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const mapRecommendation = (currentProduct, candidateProduct) => {
  return {
    product: {
      id: candidateProduct.id,
      name: candidateProduct.name,
      image_url: candidateProduct.image_url,
      category: candidateProduct.category,
      material: candidateProduct.material,
      material_variant: candidateProduct.material_variant,
      style_theme: candidateProduct.style_theme,
      dominant_color: candidateProduct.dominant_color,
      room_category: candidateProduct.room_category,
      price: candidateProduct.price,
      stock: candidateProduct.stock,
      status: candidateProduct.status
    },
    complementary_score: calculateComplementaryScore(
      currentProduct,
      candidateProduct
    ),
    different_category: hasDifferentCategory(currentProduct, candidateProduct),
    recommendation_source: 'room_complementary',
    created_at: candidateProduct.created_at
  };
};

const rankComplementaryCandidates = (currentProduct, candidates) => {
  return (candidates || [])
    .map((candidate) => mapRecommendation(currentProduct, candidate))
    .sort((itemA, itemB) => {
      if (itemA.different_category !== itemB.different_category) {
        return itemA.different_category ? -1 : 1;
      }

      if (itemB.complementary_score !== itemA.complementary_score) {
        return itemB.complementary_score - itemA.complementary_score;
      }

      return getCreatedAtTimestamp(itemB) - getCreatedAtTimestamp(itemA);
    });
};

const getActiveProductById = async (productId) => {
  const result = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE id = $1 AND status = $2
      LIMIT 1
    `,
    [productId, PRODUCT_STATUS.ACTIVE]
  );

  return result.rows[0] || null;
};

const getRuleCandidates = async (currentProduct, complementaryCategories) => {
  const result = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE status = $1
        AND id != $2
        AND room_category = $3
        AND category = ANY($4::text[])
      ORDER BY created_at DESC
    `,
    [
      PRODUCT_STATUS.ACTIVE,
      currentProduct.id,
      currentProduct.room_category,
      complementaryCategories
    ]
  );

  return result.rows;
};

const getRoomFallbackCandidates = async (currentProduct, excludedProductIds) => {
  const result = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE status = $1
        AND id != $2
        AND room_category = $3
        AND NOT (id = ANY($4::uuid[]))
      ORDER BY created_at DESC
    `,
    [
      PRODUCT_STATUS.ACTIVE,
      currentProduct.id,
      currentProduct.room_category,
      excludedProductIds
    ]
  );

  return result.rows;
};

const getRoomComplementaryRecommendations = async (productId, options = {}) => {
  const limit = normalizeLimit(options.limit);
  const currentProduct = await getActiveProductById(productId);

  if (!currentProduct) {
    return {
      notFound: true
    };
  }

  const complementaryCategories = getComplementaryCategoriesForRoom(
    currentProduct.room_category
  );

  if (complementaryCategories.length === 0) {
    return {
      current_product: {
        id: currentProduct.id,
        name: currentProduct.name,
        category: currentProduct.category,
        room_category: currentProduct.room_category
      },
      recommendations: [],
      rule: {
        room_category: currentProduct.room_category,
        complementary_categories: []
      },
      meta: {
        limit,
        fallback_used: false,
        reason: 'No room complementary rule found'
      }
    };
  }

  const ruleCandidates = await getRuleCandidates(
    currentProduct,
    complementaryCategories
  );
  const rankedRuleCandidates = rankComplementaryCandidates(
    currentProduct,
    ruleCandidates
  );
  const recommendations = rankedRuleCandidates.slice(0, limit);
  let fallbackUsed = false;

  if (recommendations.length < limit) {
    const existingIds = recommendations.map((item) => item.product.id);
    const fallbackCandidates = await getRoomFallbackCandidates(
      currentProduct,
      existingIds
    );
    const rankedFallbackCandidates = rankComplementaryCandidates(
      currentProduct,
      fallbackCandidates
    );
    const additionalRecommendations = rankedFallbackCandidates.slice(
      0,
      limit - recommendations.length
    );

    if (additionalRecommendations.length > 0) {
      fallbackUsed = true;
      recommendations.push(...additionalRecommendations);
    }
  }

  return {
    current_product: {
      id: currentProduct.id,
      name: currentProduct.name,
      category: currentProduct.category,
      room_category: currentProduct.room_category
    },
    recommendations: recommendations.map((item) => {
      const { different_category, created_at: createdAt, ...publicItem } = item;

      return publicItem;
    }),
    rule: {
      room_category: currentProduct.room_category,
      complementary_categories: complementaryCategories
    },
    meta: {
      limit,
      fallback_used: fallbackUsed,
      total_rule_candidates: ruleCandidates.length,
      total_returned: recommendations.length,
      price_used_for_score: false
    }
  };
};

module.exports = {
  normalizeLimit,
  getComplementaryCategoriesForRoom,
  calculateRoomMatch,
  calculateComplementaryCategoryMatch,
  calculateStyleMatch,
  calculateColorMatch,
  calculateComplementaryScore,
  rankComplementaryCandidates,
  getRoomComplementaryRecommendations
};

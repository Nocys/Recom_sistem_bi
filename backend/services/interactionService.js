const { query } = require('../config/db');
const { INTERACTION_WEIGHTS } = require('../utils/constants');

const INTERACTION_TYPES = Object.keys(INTERACTION_WEIGHTS);

const buildPagedProductListResponse = ({ rows, total, page, limit }) => {
  const totalItems = Number(total || 0);
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

  return {
    products: rows,
    pagination: {
      page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
      has_previous_page: page > 1 && totalPages > 0,
      has_next_page: totalPages > 0 && page < totalPages
    }
  };
};

const getActiveProductById = async (productId) => {
  const result = await query(
    `
      SELECT id, name, status
      FROM products
      WHERE id::text = $1 AND status = 'active'
      LIMIT 1
    `,
    [productId]
  );

  return result.rows[0] || null;
};

const getProductById = async (productId) => {
  const result = await query(
    `
      SELECT id, name, status
      FROM products
      WHERE id::text = $1
      LIMIT 1
    `,
    [productId]
  );

  return result.rows[0] || null;
};

const getUserProductRating = async (userId, productId) => {
  const result = await query(
    `
      SELECT
        user_id,
        product_id,
        implicit_rating,
        interaction_count,
        last_interaction_at
      FROM user_product_ratings
      WHERE user_id = $1 AND product_id = $2
      LIMIT 1
    `,
    [userId, productId]
  );

  return result.rows[0] || null;
};

const createInteraction = async (userId, productId, interactionType) => {
  if (!INTERACTION_WEIGHTS[interactionType]) {
    throw new Error(`Invalid interaction type: ${interactionType}`);
  }

  const product = await getActiveProductById(productId);

  if (!product) {
    return {
      interaction: null,
      product: null,
      rating: null
    };
  }

  const weight = INTERACTION_WEIGHTS[interactionType];
  const interactionResult = await query(
    `
      INSERT INTO interactions (user_id, product_id, interaction_type, weight)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, product_id, interaction_type, weight, created_at
    `,
    [userId, product.id, interactionType, weight]
  );

  const rating = await getUserProductRating(userId, product.id);

  return {
    interaction: interactionResult.rows[0],
    product,
    rating
  };
};

const buildStateResponse = (productId, liked, wishlisted) => {
  return {
    product_id: productId,
    liked,
    wishlisted
  };
};

const hasActiveState = async (tableName, userId, productId) => {
  const result = await query(
    `
      SELECT 1
      FROM ${tableName}
      WHERE user_id = $1 AND product_id = $2
      LIMIT 1
    `,
    [userId, productId]
  );

  return result.rows.length > 0;
};

const getProductInteractionState = async (userId, productId) => {
  const product = await getActiveProductById(productId);

  if (!product) {
    return {
      product: null,
      state: null
    };
  }

  const [liked, wishlisted] = await Promise.all([
    hasActiveState('product_likes', userId, product.id),
    hasActiveState('product_wishlists', userId, product.id)
  ]);

  return {
    product,
    state: buildStateResponse(product.id, liked, wishlisted)
  };
};

const insertActiveState = async (tableName, userId, productId) => {
  const result = await query(
    `
      INSERT INTO ${tableName} (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING id
    `,
    [userId, productId]
  );

  return result.rows.length > 0;
};

const deleteActiveState = async (tableName, userId, productId) => {
  await query(
    `
      DELETE FROM ${tableName}
      WHERE user_id = $1 AND product_id = $2
    `,
    [userId, productId]
  );
};

const likeProduct = async (userId, productId) => {
  const product = await getActiveProductById(productId);

  if (!product) {
    return {
      product: null,
      state: null,
      rating: null
    };
  }

  const inserted = await insertActiveState('product_likes', userId, product.id);
  let rating = await getUserProductRating(userId, product.id);

  if (inserted) {
    const interactionResult = await createInteraction(userId, product.id, 'like');
    rating = interactionResult.rating;
  }

  const stateResult = await getProductInteractionState(userId, product.id);

  return {
    product,
    state: stateResult.state,
    rating
  };
};

const unlikeProduct = async (userId, productId) => {
  const product = await getProductById(productId);

  if (!product) {
    return {
      product: null,
      state: null
    };
  }

  await deleteActiveState('product_likes', userId, product.id);
  const stateResult = await getProductInteractionState(userId, product.id);

  return {
    product,
    state: stateResult.state
  };
};

const wishlistProduct = async (userId, productId) => {
  const product = await getActiveProductById(productId);

  if (!product) {
    return {
      product: null,
      state: null,
      rating: null
    };
  }

  const inserted = await insertActiveState('product_wishlists', userId, product.id);
  let rating = await getUserProductRating(userId, product.id);

  if (inserted) {
    const interactionResult = await createInteraction(userId, product.id, 'favorite');
    rating = interactionResult.rating;
  }

  const stateResult = await getProductInteractionState(userId, product.id);

  return {
    product,
    state: stateResult.state,
    rating
  };
};

const unwishlistProduct = async (userId, productId) => {
  const product = await getProductById(productId);

  if (!product) {
    return {
      product: null,
      state: null
    };
  }

  await deleteActiveState('product_wishlists', userId, product.id);
  const stateResult = await getProductInteractionState(userId, product.id);

  return {
    product,
    state: stateResult.state
  };
};

const getUserRatings = async (userId) => {
  const result = await query(
    `
      SELECT
        upr.user_id,
        upr.product_id,
        upr.implicit_rating,
        upr.interaction_count,
        upr.last_interaction_at,
        p.name,
        p.category,
        p.material,
        p.style_theme,
        p.dominant_color,
        p.room_category,
        p.price,
        p.image_url
      FROM user_product_ratings upr
      JOIN products p ON p.id = upr.product_id
      WHERE upr.user_id = $1
      ORDER BY upr.implicit_rating DESC, upr.last_interaction_at DESC
    `,
    [userId]
  );

  return result.rows;
};

const getMyLikedProducts = async (userId, { page = 1, limit = 12 } = {}) => {
  const offset = (page - 1) * limit;
  const [countResult, dataResult] = await Promise.all([
    query(
      `
        SELECT COUNT(*)::int AS total
        FROM product_likes
        WHERE user_id = $1
      `,
      [userId]
    ),
    query(
      `
        SELECT
          p.id,
          p.name,
          p.image_url,
          p.category,
          p.material,
          p.style_theme,
          p.dominant_color,
          p.room_category,
          p.description,
          p.price,
          p.stock,
          p.status,
          pl.created_at AS liked_at
        FROM product_likes pl
        JOIN products p ON p.id = pl.product_id
        WHERE pl.user_id = $1
        ORDER BY pl.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    )
  ]);

  return buildPagedProductListResponse({
    rows: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit
  });
};

const getMyWishlistProducts = async (userId, { page = 1, limit = 12 } = {}) => {
  const offset = (page - 1) * limit;
  const [countResult, dataResult] = await Promise.all([
    query(
      `
        SELECT COUNT(*)::int AS total
        FROM product_wishlists
        WHERE user_id = $1
      `,
      [userId]
    ),
    query(
      `
        SELECT
          p.id,
          p.name,
          p.image_url,
          p.category,
          p.material,
          p.style_theme,
          p.dominant_color,
          p.room_category,
          p.description,
          p.price,
          p.stock,
          p.status,
          pw.created_at AS wishlisted_at
        FROM product_wishlists pw
        JOIN products p ON p.id = pw.product_id
        WHERE pw.user_id = $1
        ORDER BY pw.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    )
  ]);

  return buildPagedProductListResponse({
    rows: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit
  });
};

const buildHistoryFilters = ({ interaction_type }) => {
  const where = ['i.user_id = $1'];
  const params = [];

  if (interaction_type) {
    params.push(interaction_type);
    where.push(`i.interaction_type = $${params.length + 1}`);
  }

  return {
    whereClause: `WHERE ${where.join(' AND ')}`,
    params
  };
};

const getUserInteractionHistory = async (userId, filters) => {
  const { whereClause, params } = buildHistoryFilters(filters);
  const baseParams = [userId, ...params];

  const countResult = await query(
    `
      SELECT COUNT(*)::int AS total
      FROM interactions i
      ${whereClause}
    `,
    baseParams
  );

  const dataResult = await query(
    `
      SELECT
        i.id,
        i.interaction_type,
        i.weight,
        i.created_at,
        p.id AS product_id,
        p.name AS product_name,
        p.image_url AS product_image_url,
        p.category AS product_category,
        p.price AS product_price
      FROM interactions i
      JOIN products p ON p.id = i.product_id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${baseParams.length + 1}
      OFFSET $${baseParams.length + 2}
    `,
    [...baseParams, filters.limit, filters.offset]
  );

  return {
    interactions: dataResult.rows,
    total: countResult.rows[0].total,
    limit: filters.limit,
    offset: filters.offset
  };
};

const getInteractionTypeCounts = async (userId) => {
  const result = await query(
    `
      SELECT interaction_type, COUNT(*)::int AS total
      FROM interactions
      WHERE user_id = $1
      GROUP BY interaction_type
    `,
    [userId]
  );

  return INTERACTION_TYPES.reduce((counts, interactionType) => {
    const row = result.rows.find((item) => item.interaction_type === interactionType);
    counts[interactionType] = row ? row.total : 0;
    return counts;
  }, {});
};

const getTopProductMetadata = async (userId, columnName, alias) => {
  const result = await query(
    `
      SELECT p.${columnName} AS value, COUNT(*)::int AS total
      FROM interactions i
      JOIN products p ON p.id = i.product_id
      WHERE i.user_id = $1
      GROUP BY p.${columnName}
      ORDER BY total DESC, value ASC
      LIMIT 5
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    [alias]: row.value,
    total: row.total
  }));
};

const getUserInteractionSummary = async (userId) => {
  const totalResult = await query(
    `
      SELECT
        COUNT(*)::int AS total_interactions,
        COUNT(DISTINCT product_id)::int AS unique_products
      FROM interactions
      WHERE user_id = $1
    `,
    [userId]
  );

  const byType = await getInteractionTypeCounts(userId);

  const [
    topCategories,
    topMaterials,
    topStyleThemes,
    topColors,
    topRoomCategories
  ] = await Promise.all([
    getTopProductMetadata(userId, 'category', 'category'),
    getTopProductMetadata(userId, 'material', 'material'),
    getTopProductMetadata(userId, 'style_theme', 'style_theme'),
    getTopProductMetadata(userId, 'dominant_color', 'dominant_color'),
    getTopProductMetadata(userId, 'room_category', 'room_category')
  ]);

  return {
    total_interactions: totalResult.rows[0].total_interactions,
    unique_products: totalResult.rows[0].unique_products,
    by_type: byType,
    top_categories: topCategories,
    top_materials: topMaterials,
    top_style_themes: topStyleThemes,
    top_colors: topColors,
    top_room_categories: topRoomCategories
  };
};

module.exports = {
  getActiveProductById,
  getProductById,
  createInteraction,
  getUserProductRating,
  getProductInteractionState,
  likeProduct,
  unlikeProduct,
  wishlistProduct,
  unwishlistProduct,
  getMyLikedProducts,
  getMyWishlistProducts,
  getUserRatings,
  getUserInteractionHistory,
  getUserInteractionSummary
};

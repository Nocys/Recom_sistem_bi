const { pool, query } = require('../config/db');
const { PRODUCT_STATUS } = require('../utils/constants');

const PRODUCT_FIELDS = `
  id,
  name,
  image_url,
  category,
  material,
  material_variant,
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

const SEARCH_COLUMNS = [
  'name',
  'description',
  'category',
  'material',
  'material_variant',
  'style_theme',
  'dominant_color',
  'room_category'
];

const PRODUCT_MUTATION_FIELDS = [
  'name',
  'image_url',
  'category',
  'material',
  'material_variant',
  'style_theme',
  'dominant_color',
  'room_category',
  'description',
  'price',
  'stock',
  'status'
];

const buildProductMutationValues = (productData) => {
  return PRODUCT_MUTATION_FIELDS.map((field) => {
    if (field === 'stock') {
      return productData.stock === undefined ? null : productData.stock;
    }

    return productData[field];
  });
};

const buildProductFilters = ({ category, search, status, activeOnly = false }) => {
  const where = [];
  const params = [];

  if (activeOnly) {
    params.push(PRODUCT_STATUS.ACTIVE);
    where.push(`status = $${params.length}`);
  }

  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    const searchParamIndex = params.length;
    const searchConditions = SEARCH_COLUMNS.map((column) => {
      return `${column} ILIKE $${searchParamIndex}`;
    });
    where.push(`(${searchConditions.join(' OR ')})`);
  }

  return {
    whereClause: where.length > 0 ? `WHERE ${where.join(' AND ')}` : '',
    params
  };
};

const getProductsWithFilters = async ({ whereClause, params, limit, offset }) => {
  const countResult = await query(
    `
      SELECT COUNT(*)::int AS total
      FROM products
      ${whereClause}
    `,
    params
  );

  const dataResult = await query(
    `
      SELECT ${PRODUCT_FIELDS}
      FROM products
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `,
    [...params, limit, offset]
  );

  return {
    products: dataResult.rows,
    total: countResult.rows[0].total,
    limit,
    offset
  };
};

const getPublicProducts = async (filters) => {
  const { whereClause, params } = buildProductFilters({
    category: filters.category,
    search: filters.search,
    activeOnly: true
  });

  return getProductsWithFilters({
    whereClause,
    params,
    limit: filters.limit,
    offset: filters.offset
  });
};

const getPublicProductById = async (id) => {
  const result = await query(
    `
      SELECT ${PRODUCT_FIELDS}
      FROM products
      WHERE id = $1 AND status = $2
      LIMIT 1
    `,
    [id, PRODUCT_STATUS.ACTIVE]
  );

  return result.rows[0] || null;
};

const getAdminProducts = async (filters) => {
  const { whereClause, params } = buildProductFilters({
    category: filters.category,
    status: filters.status,
    search: filters.search
  });

  return getProductsWithFilters({
    whereClause,
    params,
    limit: filters.limit,
    offset: filters.offset
  });
};

const getAdminProductById = async (id) => {
  const result = await query(
    `
      SELECT ${PRODUCT_FIELDS}
      FROM products
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
};

const createProduct = async (productData) => {
  const values = buildProductMutationValues(productData);
  const placeholders = PRODUCT_MUTATION_FIELDS.map((field, index) => {
    return `$${index + 1}`;
  });

  const result = await query(
    `
      INSERT INTO products (${PRODUCT_MUTATION_FIELDS.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING ${PRODUCT_FIELDS}
    `,
    values
  );

  return result.rows[0];
};

const updateProduct = async (id, productData) => {
  const setClauses = PRODUCT_MUTATION_FIELDS.map((field, index) => {
    return `${field} = $${index + 2}`;
  });
  const values = buildProductMutationValues(productData);

  const result = await query(
    `
      UPDATE products
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING ${PRODUCT_FIELDS}
    `,
    [id, ...values]
  );

  return result.rows[0] || null;
};

const deactivateProduct = async (id) => {
  const result = await query(
    `
      UPDATE products
      SET status = $2
      WHERE id = $1
      RETURNING ${PRODUCT_FIELDS}
    `,
    [id, PRODUCT_STATUS.INACTIVE]
  );

  return result.rows[0] || null;
};

const getProductActivityCounts = async (productId) => {
  const result = await query(
    `
      SELECT
        (SELECT COUNT(*) FROM interactions WHERE product_id = $1) AS interaction_count,
        (SELECT COUNT(*) FROM product_likes WHERE product_id = $1) AS like_count,
        (SELECT COUNT(*) FROM product_wishlists WHERE product_id = $1) AS wishlist_count
    `,
    [productId]
  );

  const counts = result.rows[0] || {};
  const interactionCount = Number(counts.interaction_count || 0);
  const likeCount = Number(counts.like_count || 0);
  const wishlistCount = Number(counts.wishlist_count || 0);

  return {
    interaction_count: interactionCount,
    like_count: likeCount,
    wishlist_count: wishlistCount
  };
};

const permanentlyDeleteProduct = async (id) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      `
        SELECT ${PRODUCT_FIELDS}
        FROM products
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const likeDeleteResult = await client.query(
      'DELETE FROM product_likes WHERE product_id = $1',
      [id]
    );
    const wishlistDeleteResult = await client.query(
      'DELETE FROM product_wishlists WHERE product_id = $1',
      [id]
    );
    const interactionDeleteResult = await client.query(
      'DELETE FROM interactions WHERE product_id = $1',
      [id]
    );
    const productDeleteResult = await client.query(
      `
        DELETE FROM products
        WHERE id = $1
        RETURNING ${PRODUCT_FIELDS}
      `,
      [id]
    );

    await client.query('COMMIT');

    return {
      deleted_product: productDeleteResult.rows[0] || productResult.rows[0],
      deleted_related_activity: {
        likes: likeDeleteResult.rowCount,
        wishlists: wishlistDeleteResult.rowCount,
        interactions: interactionDeleteResult.rowCount
      }
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getPublicProducts,
  getPublicProductById,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  getProductActivityCounts,
  permanentlyDeleteProduct
};

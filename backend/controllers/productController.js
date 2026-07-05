const productService = require('../services/productService');
const { PRODUCT_CATEGORIES, PRODUCT_STATUS } = require('../utils/constants');
const { sendError, sendSuccess } = require('../utils/response');

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length > 0 ? normalized : null;
};

const parsePagination = ({ limit, offset }, defaultLimit, maxLimit) => {
  const parsedLimit = Number.parseInt(limit, 10);
  const parsedOffset = Number.parseInt(offset, 10);

  return {
    limit:
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, maxLimit)
        : defaultLimit,
    offset:
      Number.isInteger(parsedOffset) && parsedOffset >= 0
        ? parsedOffset
        : 0
  };
};

const parseListFilters = (query, options) => {
  const category = normalizeOptionalString(query.category);
  const status = normalizeOptionalString(query.status);
  const search = normalizeOptionalString(query.search);
  const pagination = parsePagination(
    query,
    options.defaultLimit,
    options.maxLimit
  );
  const errors = [];

  if (category && !PRODUCT_CATEGORIES.includes(category)) {
    errors.push({
      field: 'category',
      message: `category must be one of: ${PRODUCT_CATEGORIES.join(', ')}.`
    });
  }

  if (options.includeStatus && status && !Object.values(PRODUCT_STATUS).includes(status)) {
    errors.push({
      field: 'status',
      message: `status must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}.`
    });
  }

  return {
    filters: {
      category,
      status: options.includeStatus ? status : null,
      search,
      ...pagination
    },
    errors
  };
};

const ensureValidProductId = (id, res) => {
  if (!UUID_REGEX.test(id)) {
    sendError(res, 'Invalid product id.', 400, {
      fields: [
        {
          field: 'id',
          message: 'id must be a valid UUID.'
        }
      ]
    });
    return false;
  }

  return true;
};

const buildPaginationResponse = (result) => {
  return {
    limit: result.limit,
    offset: result.offset,
    total: result.total
  };
};

const productHealth = (req, res) => {
  return sendSuccess(
    res,
    'Product controller is ready. Public product endpoints are available in Bagian 5.'
  );
};

const adminProductHealth = (req, res) => {
  return sendSuccess(
    res,
    'Admin product controller is ready. Product CRUD is available in Bagian 5.'
  );
};

const adminProtectedHealth = (req, res) => {
  return sendSuccess(res, 'Admin protected route is working', {
    role: 'admin'
  });
};

const getPublicProducts = async (req, res, next) => {
  try {
    const { filters, errors } = parseListFilters(req.query, {
      defaultLimit: 12,
      maxLimit: 50,
      includeStatus: false
    });

    if (errors.length > 0) {
      return sendError(res, 'Product filter validation failed', 400, {
        fields: errors
      });
    }

    const result = await productService.getPublicProducts(filters);

    return sendSuccess(res, 'Products retrieved successfully', {
      products: result.products,
      pagination: buildPaginationResponse(result)
    });
  } catch (error) {
    return next(error);
  }
};

const getPublicProductById = async (req, res, next) => {
  try {
    if (!ensureValidProductId(req.params.id, res)) {
      return null;
    }

    const product = await productService.getPublicProductById(req.params.id);

    if (!product) {
      return sendError(res, 'Product not found.', 404);
    }

    return sendSuccess(res, 'Product detail retrieved successfully', {
      product
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const { filters, errors } = parseListFilters(req.query, {
      defaultLimit: 20,
      maxLimit: 100,
      includeStatus: true
    });

    if (errors.length > 0) {
      return sendError(res, 'Product filter validation failed', 400, {
        fields: errors
      });
    }

    const result = await productService.getAdminProducts(filters);

    return sendSuccess(res, 'Admin products retrieved successfully', {
      products: result.products,
      pagination: buildPaginationResponse(result)
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminProductById = async (req, res, next) => {
  try {
    if (!ensureValidProductId(req.params.id, res)) {
      return null;
    }

    const product = await productService.getAdminProductById(req.params.id);

    if (!product) {
      return sendError(res, 'Product not found.', 404);
    }

    return sendSuccess(res, 'Admin product detail retrieved successfully', {
      product
    });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    return sendSuccess(
      res,
      'Product created successfully',
      {
        product
      },
      201
    );
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!ensureValidProductId(req.params.id, res)) {
      return null;
    }

    const product = await productService.updateProduct(req.params.id, req.body);

    if (!product) {
      return sendError(res, 'Product not found.', 404);
    }

    return sendSuccess(res, 'Product updated successfully', {
      product
    });
  } catch (error) {
    return next(error);
  }
};

const deactivateProduct = async (req, res, next) => {
  try {
    if (!ensureValidProductId(req.params.id, res)) {
      return null;
    }

    const product = await productService.deactivateProduct(req.params.id);

    if (!product) {
      return sendError(res, 'Product not found.', 404);
    }

    return sendSuccess(res, 'Product deactivated successfully', {
      product
    });
  } catch (error) {
    return next(error);
  }
};

const permanentlyDeleteProduct = async (req, res, next) => {
  try {
    if (!ensureValidProductId(req.params.id, res)) {
      return null;
    }

    const result = await productService.permanentlyDeleteProduct(req.params.id);

    if (!result) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, 'Product permanently deleted successfully', result);
  } catch (error) {
    return next(error);
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
  permanentlyDeleteProduct,
  productHealth,
  adminProductHealth,
  adminProtectedHealth
};

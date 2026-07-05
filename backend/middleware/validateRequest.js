const { sendError } = require('../utils/response');
const {
  NON_STOCK_CATEGORIES,
  PRODUCT_CATEGORIES,
  MATERIAL_VARIANTS,
  PRODUCT_MATERIALS,
  PRODUCT_STATUS,
  ROOM_CATEGORIES,
  STOCK_TRACKED_CATEGORIES,
  STYLE_THEMES
} = require('../utils/constants');

const PRODUCT_REQUIRED_FIELDS = [
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
  'status'
];

const PRODUCT_STRING_FIELDS = [
  'name',
  'image_url',
  'category',
  'material',
  'material_variant',
  'style_theme',
  'dominant_color',
  'room_category',
  'description',
  'status'
];

const PRODUCT_NUMERIC_FIELDS = ['price', 'stock'];

const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter((field) => {
      return (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ''
      );
    });

    if (missingFields.length > 0) {
      return sendError(res, 'Missing required fields.', 400, { missingFields });
    }

    return next();
  };
};

const isEmptyValue = (value) => {
  return value === undefined || value === null || value === '';
};

const isNumericInput = (value) => {
  return typeof value === 'number' || typeof value === 'string';
};

const validateProductPayload = (req, res, next) => {
  const errors = [];

  PRODUCT_STRING_FIELDS.forEach((field) => {
    if (typeof req.body[field] === 'string') {
      req.body[field] = req.body[field].trim();
    }
  });

  PRODUCT_NUMERIC_FIELDS.forEach((field) => {
    if (typeof req.body[field] === 'string') {
      req.body[field] = req.body[field].trim();
    }
  });

  if (isEmptyValue(req.body.material_variant)) {
    req.body.material_variant = 'Tidak Ada';
  }

  PRODUCT_REQUIRED_FIELDS.forEach((field) => {
    if (isEmptyValue(req.body[field])) {
      errors.push({
        field,
        message: `${field} is required.`
      });
    }
  });

  PRODUCT_STRING_FIELDS.forEach((field) => {
    if (!isEmptyValue(req.body[field]) && typeof req.body[field] !== 'string') {
      errors.push({
        field,
        message: `${field} must be a non-empty string.`
      });
    }
  });

  if (
    typeof req.body.category === 'string' &&
    req.body.category &&
    !PRODUCT_CATEGORIES.includes(req.body.category)
  ) {
    errors.push({
      field: 'category',
      message: `category must be one of: ${PRODUCT_CATEGORIES.join(', ')}.`
    });
  }

  if (
    typeof req.body.material === 'string' &&
    req.body.material &&
    !PRODUCT_MATERIALS.includes(req.body.material)
  ) {
    errors.push({
      field: 'material',
      message: `material must be one of: ${PRODUCT_MATERIALS.join(', ')}.`
    });
  }

  if (
    typeof req.body.material_variant === 'string' &&
    req.body.material_variant &&
    !MATERIAL_VARIANTS.includes(req.body.material_variant)
  ) {
    errors.push({
      field: 'material_variant',
      message: `material_variant must be one of: ${MATERIAL_VARIANTS.join(', ')}.`
    });
  }

  if (
    typeof req.body.room_category === 'string' &&
    req.body.room_category &&
    !ROOM_CATEGORIES.includes(req.body.room_category)
  ) {
    errors.push({
      field: 'room_category',
      message: `room_category must be one of: ${ROOM_CATEGORIES.join(', ')}.`
    });
  }

  if (
    typeof req.body.style_theme === 'string' &&
    req.body.style_theme &&
    !STYLE_THEMES.includes(req.body.style_theme)
  ) {
    errors.push({
      field: 'style_theme',
      message: `style_theme must be one of: ${STYLE_THEMES.join(', ')}.`
    });
  }

  const validStatuses = Object.values(PRODUCT_STATUS);

  if (
    typeof req.body.status === 'string' &&
    req.body.status &&
    !validStatuses.includes(req.body.status)
  ) {
    errors.push({
      field: 'status',
      message: `status must be one of: ${validStatuses.join(', ')}.`
    });
  }

  if (!isEmptyValue(req.body.price)) {
    const price = isNumericInput(req.body.price) ? Number(req.body.price) : NaN;

    if (!Number.isFinite(price) || price < 0) {
      errors.push({
        field: 'price',
        message: 'price must be a number greater than or equal to 0.'
      });
    } else {
      req.body.price = price;
    }
  }

  const isStockTrackedCategory = STOCK_TRACKED_CATEGORIES.includes(req.body.category);
  const isNonStockCategory = NON_STOCK_CATEGORIES.includes(req.body.category);

  if (isStockTrackedCategory) {
    if (isEmptyValue(req.body.stock)) {
      errors.push({
        field: 'stock',
        message: `stock is required for categories: ${STOCK_TRACKED_CATEGORIES.join(', ')}.`
      });
    }
  }

  if (isNonStockCategory) {
    req.body.stock = null;
  } else if (!isEmptyValue(req.body.stock)) {
    const stock = isNumericInput(req.body.stock) ? Number(req.body.stock) : NaN;

    if (!Number.isInteger(stock) || stock < 0) {
      errors.push({
        field: 'stock',
        message: 'stock must be an integer greater than or equal to 0.'
      });
    } else {
      req.body.stock = stock;
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Product validation failed', 400, {
      fields: errors
    });
  }

  return next();
};

const validateProductIdPayload = (req, res, next) => {
  const { product_id } = req.body;

  if (
    product_id === undefined ||
    product_id === null ||
    typeof product_id !== 'string' ||
    product_id.trim() === ''
  ) {
    return sendError(res, 'Product ID is required', 400, {
      field: 'product_id'
    });
  }

  req.body.product_id = product_id.trim();

  return next();
};

module.exports = {
  validateRequiredFields,
  validateProductPayload,
  validateProductIdPayload
};

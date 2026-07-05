const express = require('express');
const productController = require('../controllers/productController');
const requireAdmin = require('../middleware/requireAdmin');
const requireAuth = require('../middleware/requireAuth');
const { validateProductPayload } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/health', productController.adminProductHealth);
router.get(
  '/protected-health',
  requireAuth,
  requireAdmin,
  productController.adminProtectedHealth
);

router.get('/', requireAuth, requireAdmin, productController.getAdminProducts);
router.get('/:id', requireAuth, requireAdmin, productController.getAdminProductById);
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateProductPayload,
  productController.createProduct
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateProductPayload,
  productController.updateProduct
);
router.delete(
  '/:id/permanent',
  requireAuth,
  requireAdmin,
  productController.permanentlyDeleteProduct
);
router.delete('/:id', requireAuth, requireAdmin, productController.deactivateProduct);

module.exports = router;

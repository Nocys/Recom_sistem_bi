const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/health', productController.productHealth);
router.get('/', productController.getPublicProducts);
router.get('/:id', productController.getPublicProductById);

module.exports = router;

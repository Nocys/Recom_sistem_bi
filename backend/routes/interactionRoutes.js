const express = require('express');
const interactionController = require('../controllers/interactionController');
const requireAuth = require('../middleware/requireAuth');
const { validateProductIdPayload } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/health', interactionController.interactionHealth);

router.get(
  '/product-state/:productId',
  requireAuth,
  interactionController.getProductInteractionState
);

router.post(
  '/view',
  requireAuth,
  validateProductIdPayload,
  interactionController.logPageView
);
router.post(
  '/like',
  requireAuth,
  validateProductIdPayload,
  interactionController.likeProduct
);

router.delete(
  '/like/:productId',
  requireAuth,
  interactionController.unlikeProduct
);

router.post(
  '/wishlist',
  requireAuth,
  validateProductIdPayload,
  interactionController.wishlistProduct
);

router.delete(
  '/wishlist/:productId',
  requireAuth,
  interactionController.unwishlistProduct
);

router.post(
  '/favorite',
  requireAuth,
  validateProductIdPayload,
  interactionController.wishlistProduct
);
router.post(
  '/whatsapp',
  requireAuth,
  validateProductIdPayload,
  interactionController.logWhatsappInquiry
);

router.get(
  '/my-liked-products',
  requireAuth,
  interactionController.getMyLikedProducts
);
router.get(
  '/my-wishlist-products',
  requireAuth,
  interactionController.getMyWishlistProducts
);
router.get('/my-history', requireAuth, interactionController.getMyHistory);
router.get('/my-ratings', requireAuth, interactionController.getMyRatings);
router.get('/my-summary', requireAuth, interactionController.getMySummary);

module.exports = router;

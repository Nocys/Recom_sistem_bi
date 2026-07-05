const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/health', recommendationController.recommendationHealth);
router.get(
  '/content-based',
  requireAuth,
  recommendationController.getContentBasedRecommendations
);
router.get(
  '/user-based',
  requireAuth,
  recommendationController.getUserBasedRecommendations
);
router.get(
  '/hybrid',
  requireAuth,
  recommendationController.getHybridRecommendations
);
router.get(
  '/personal',
  requireAuth,
  recommendationController.getPersonalRecommendations
);
router.get('/cold-start', recommendationController.getColdStartRecommendations);
router.get(
  '/room-complementary/:productId',
  recommendationController.getRoomComplementaryRecommendations
);

module.exports = router;

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const {
  calculateHybridScore,
  mergeRecommendationScores
} = require('../services/hybridRecommendationService');

describe('hybrid recommendation pure logic', () => {
  test('calculateHybridScore uses 0.7 CBF and 0.3 CF weights', () => {
    expect(calculateHybridScore(0.8, 0.6)).toBeCloseTo(0.74, 3);
  });

  test('calculateHybridScore clamps component scores to 0-1', () => {
    expect(calculateHybridScore(1.2, -0.5)).toBeCloseTo(0.7, 6);
  });

  test('mergeRecommendationScores combines CBF and CF scores by product id', () => {
    const cbfRecommendations = [
      { product_id: 'P1', name: 'Product 1', cbf_score: 0.9 },
      { product_id: 'P2', name: 'Product 2', cbf_score: 0.7 }
    ];
    const cfRecommendations = [
      { product_id: 'P1', name: 'Product 1', cf_score: 0.6 },
      { product_id: 'P3', name: 'Product 3', cf_score: 0.8 }
    ];

    const merged = mergeRecommendationScores(cbfRecommendations, cfRecommendations);

    expect(merged.map((item) => item.product_id)).toEqual(['P1', 'P2', 'P3']);
    expect(merged[0].final_score).toBeCloseTo(0.81, 6);
    expect(merged[1].final_score).toBeCloseTo(0.49, 6);
    expect(merged[2].final_score).toBeCloseTo(0.24, 6);
    expect(merged[0].cbf_score).toBeCloseTo(0.9, 6);
    expect(merged[0].cf_score).toBeCloseTo(0.6, 6);
  });
});

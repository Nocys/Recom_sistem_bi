jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const {
  buildProductVocabulary,
  buildUserProductMatrix,
  buildUserVector,
  calculateCandidateScore,
  calculateUserSimilarities,
  generateUserBasedRecommendationsFromRows,
  getCandidateProducts,
  getTopSimilarUsers,
  normalizeCFScore
} = require('../services/userBasedService');

describe('user-based collaborative filtering pure logic', () => {
  test('buildUserProductMatrix creates a user-product score matrix', () => {
    const preferenceRows = [
      { user_id: 'U1', product_id: 'P1', implicit_score: 2.5 },
      { user_id: 'U1', product_id: 'P2', implicit_score: 5.0 },
      { user_id: 'U2', product_id: 'P1', implicit_score: 1.0 },
      { user_id: 'U2', product_id: 'P3', implicit_score: 4.0 }
    ];

    expect(buildUserProductMatrix(preferenceRows)).toEqual({
      U1: {
        P1: 2.5,
        P2: 5.0
      },
      U2: {
        P1: 1.0,
        P3: 4.0
      }
    });
  });

  test('buildProductVocabulary returns deterministic sorted product ids', () => {
    const preferenceRows = [
      { user_id: 'U1', product_id: 'P2', implicit_score: 5 },
      { user_id: 'U1', product_id: 'P1', implicit_score: 2.5 },
      { user_id: 'U2', product_id: 'P3', implicit_score: 4 }
    ];

    expect(buildProductVocabulary(preferenceRows)).toEqual(['P1', 'P2', 'P3']);
  });

  test('buildUserVector maps a user matrix row to the product vocabulary', () => {
    const vocabulary = ['P1', 'P2', 'P3'];
    const matrix = {
      U1: {
        P1: 2.5,
        P2: 5.0
      }
    };

    expect(buildUserVector('U1', vocabulary, matrix)).toEqual([2.5, 5.0, 0]);
    expect(buildUserVector('unknown-user', vocabulary, matrix)).toEqual([0, 0, 0]);
  });

  test('calculateUserSimilarities uses cosine similarity between user vectors', () => {
    const matrix = {
      U1: {
        P1: 2.5,
        P2: 2.5
      },
      U2: {
        P1: 3.5,
        P3: 1.5
      }
    };
    const vocabulary = ['P1', 'P2', 'P3'];
    const similarities = calculateUserSimilarities('U1', matrix, vocabulary);

    expect(similarities).toHaveLength(1);
    expect(similarities[0].user_id).toBe('U2');
    expect(similarities[0].similarity).toBeCloseTo(0.65, 2);
  });

  test('calculateUserSimilarities ranks similar users and excludes target or zero-overlap users', () => {
    const matrix = {
      U1: { P1: 2.5, P2: 2.5 },
      U2: { P1: 3.5, P3: 1.5 },
      U3: { P2: 2.5, P3: 5.0 },
      U4: { P4: 5.0 }
    };
    const vocabulary = ['P1', 'P2', 'P3', 'P4'];
    const similarities = calculateUserSimilarities('U1', matrix, vocabulary);

    expect(similarities.map((item) => item.user_id)).toEqual(['U2', 'U3']);
    expect(similarities[0].similarity).toBeGreaterThan(similarities[1].similarity);
    expect(similarities.some((item) => item.user_id === 'U1')).toBe(false);
    expect(similarities.some((item) => item.user_id === 'U4')).toBe(false);
  });

  test('getTopSimilarUsers limits ranked users', () => {
    const similarities = [
      { user_id: 'U2', similarity: 0.8 },
      { user_id: 'U3', similarity: 0.6 },
      { user_id: 'U4', similarity: 0.4 }
    ];

    expect(getTopSimilarUsers(similarities, 2)).toEqual([
      { user_id: 'U2', similarity: 0.8 },
      { user_id: 'U3', similarity: 0.6 }
    ]);
  });

  test('getCandidateProducts excludes products already preferred by the target user', () => {
    const matrix = {
      U1: { P1: 2.5, P2: 2.5 },
      U2: { P1: 3.5, P3: 4.0 },
      U3: { P2: 2.5, P4: 5.0 }
    };
    const similarUsers = [
      { user_id: 'U2', similarity: 0.65 },
      { user_id: 'U3', similarity: 0.8 }
    ];

    expect(getCandidateProducts('U1', similarUsers, matrix)).toEqual(['P3', 'P4']);
  });

  test('calculateCandidateScore uses only neighbors with positive score for candidate product', () => {
    const similarUsers = [
      { user_id: 'U2', similarity: 0.65 },
      { user_id: 'U3', similarity: 0.8 }
    ];
    const matrix = {
      U2: { P4: 2.5, P5: 0 },
      U3: { P4: 5.0, P5: 1.5 }
    };

    expect(calculateCandidateScore('P4', similarUsers, matrix)).toBeCloseTo(3.879, 3);
    expect(calculateCandidateScore('P5', similarUsers, matrix)).toBeCloseTo(1.5, 6);
  });

  test('normalizeCFScore clamps predicted preference score to 0-1', () => {
    expect(normalizeCFScore(0)).toBe(0);
    expect(normalizeCFScore(2.5)).toBe(0.5);
    expect(normalizeCFScore(5.0)).toBe(1);
    expect(normalizeCFScore(6.0)).toBe(1);
    expect(normalizeCFScore(-1)).toBe(0);
  });

  test('generateUserBasedRecommendationsFromRows returns normalized CF recommendations without target products', () => {
    const preferenceRows = [
      { user_id: 'U1', product_id: 'P1', implicit_score: 2.5 },
      { user_id: 'U1', product_id: 'P2', implicit_score: 2.5 },
      { user_id: 'U2', product_id: 'P1', implicit_score: 3.5 },
      { user_id: 'U2', product_id: 'P3', implicit_score: 4.0 },
      { user_id: 'U3', product_id: 'P2', implicit_score: 2.5 },
      { user_id: 'U3', product_id: 'P4', implicit_score: 5.0 }
    ];

    const recommendations = generateUserBasedRecommendationsFromRows('U1', preferenceRows);
    const productIds = recommendations.map((item) => item.product_id);

    expect(productIds).not.toContain('P1');
    expect(productIds).not.toContain('P2');
    expect(productIds).toEqual(expect.arrayContaining(['P3', 'P4']));
    recommendations.forEach((item) => {
      expect(item).toHaveProperty('product_id');
      expect(item).toHaveProperty('predicted_preference_score');
      expect(item).toHaveProperty('cf_score');
      expect(item).toHaveProperty('recommendation_source', 'user_based_cf');
      expect(item.cf_score).toBeGreaterThanOrEqual(0);
      expect(item.cf_score).toBeLessThanOrEqual(1);
    });
  });
});

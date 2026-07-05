const {
  cosineSimilarity,
  dotProduct,
  vectorMagnitude
} = require('../utils/math');

describe('math utilities', () => {
  test('dotProduct multiplies matching vector dimensions', () => {
    expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  test('vectorMagnitude calculates euclidean vector length', () => {
    expect(vectorMagnitude([3, 4])).toBe(5);
  });

  test('cosineSimilarity returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 6);
  });

  test('cosineSimilarity returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  test('cosineSimilarity returns 0 when one vector has zero magnitude', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0);
  });
});

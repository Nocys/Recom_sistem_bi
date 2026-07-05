jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const {
  calculateImplicitPreferenceScore
} = require('../services/userBasedService');

describe('implicit preference score', () => {
  test.each([
    ['tidak ada interaksi', {}, 0],
    ['like saja', { active_like: 1 }, 1.0],
    ['wishlist saja', { active_wishlist: 1 }, 1.5],
    ['tanya admin saja', { has_whatsapp_inquiry: 1 }, 2.5],
    ['like + wishlist', { active_like: 1, active_wishlist: 1 }, 2.5],
    ['like + tanya admin', { active_like: 1, has_whatsapp_inquiry: 1 }, 3.5],
    ['wishlist + tanya admin', { active_wishlist: 1, has_whatsapp_inquiry: 1 }, 4.0],
    [
      'like + wishlist + tanya admin',
      { active_like: 1, active_wishlist: 1, has_whatsapp_inquiry: 1 },
      5.0
    ]
  ])('%s menghasilkan skor %s', (caseName, input, expectedScore) => {
    expect(calculateImplicitPreferenceScore(input)).toBe(expectedScore);
  });

  test('preference flags are binary, not interaction counts', () => {
    expect(
      calculateImplicitPreferenceScore({
        active_like: 3,
        active_wishlist: 2,
        has_whatsapp_inquiry: 5
      })
    ).toBe(5.0);
  });

  test('page_view is not a preference score input', () => {
    expect(calculateImplicitPreferenceScore({ page_view: 1 })).toBe(0);
  });
});

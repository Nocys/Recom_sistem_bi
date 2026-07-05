const INTERACTION_WEIGHTS = {
  page_view: 1.0,
  like: 1.0,
  favorite: 1.5,
  whatsapp_inquiry: 1.5
};

const HYBRID_WEIGHTS = {
  contentBased: 0.7,
  collaborativeFiltering: 0.3
};

const MAX_IMPLICIT_RATING = 5.0;

const IMPLICIT_PREFERENCE_WEIGHTS = {
  LIKE: 1.0,
  WISHLIST: 1.5,
  WHATSAPP_INQUIRY: 2.5
};

const MAX_IMPLICIT_PREFERENCE_SCORE = 5.0;

const CF_EXCLUDED_INTERACTIONS = ['page_view'];

const PRODUCT_CATEGORIES = [
  'Kitchen Set',
  'Living Set',
  'Bedset',
  'Minibar',
  'Meja',
  'Kursi',
  'Lemari',
  'Nakas',
  'Meja Rias'
];

const ROOM_CATEGORIES = [
  'Ruang Tamu',
  'Ruang Makan',
  'Dapur',
  'Kamar Tidur',
  'Mini Bar'
];

const STYLE_THEMES = [
  'Modern',
  'Minimalis',
  'Japandi'
];

const PRODUCT_MATERIALS = [
  'HPL',
  'Kayu',
  'Logam',
  'Kaca',
  'Linen',
  'Kayu + Logam',
  'Logam + Linen',
  'Kayu + Linen',
  'HPL + Kaca'
];

const MATERIAL_VARIANTS = [
  'Tidak Ada',
  'Woodgrain',
  'Solid',
  'Marble',
  'Glossy'
];

const STOCK_TRACKED_CATEGORIES = [
  'Meja',
  'Kursi',
  'Lemari',
  'Nakas',
  'Meja Rias'
];

const NON_STOCK_CATEGORIES = [
  'Kitchen Set',
  'Living Set',
  'Bedset',
  'Minibar'
];

const ROOM_COMPLEMENTARY_RULES = {
  'Kamar Tidur': ['Bedset', 'Lemari', 'Nakas', 'Meja Rias'],
  'Ruang Tamu': ['Living Set', 'Meja', 'Kursi'],
  'Ruang Makan': ['Meja', 'Kursi'],
  Dapur: ['Kitchen Set', 'Meja', 'Kursi'],
  'Mini Bar': ['Minibar', 'Kursi', 'Meja']
};

const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

module.exports = {
  INTERACTION_WEIGHTS,
  HYBRID_WEIGHTS,
  MAX_IMPLICIT_RATING,
  IMPLICIT_PREFERENCE_WEIGHTS,
  MAX_IMPLICIT_PREFERENCE_SCORE,
  CF_EXCLUDED_INTERACTIONS,
  PRODUCT_CATEGORIES,
  ROOM_CATEGORIES,
  STYLE_THEMES,
  PRODUCT_MATERIALS,
  MATERIAL_VARIANTS,
  STOCK_TRACKED_CATEGORIES,
  NON_STOCK_CATEGORIES,
  ROOM_COMPLEMENTARY_RULES,
  PRODUCT_STATUS,
  USER_ROLES
};

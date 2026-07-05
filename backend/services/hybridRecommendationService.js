const { query } = require('../config/db');
const contentBasedService = require('./contentBasedService');
const userBasedService = require('./userBasedService');
const { HYBRID_WEIGHTS } = require('../utils/constants');

const DEFAULT_RECOMMENDATION_LIMIT = 10;
const MAX_RECOMMENDATION_LIMIT = 10;
const MIN_RECOMMENDATION_LIMIT = 5;

const PRODUCT_SELECT_FIELDS = `
  id,
  name,
  image_url,
  category,
  material,
  style_theme,
  dominant_color,
  room_category,
  description,
  price,
  stock,
  status,
  created_at,
  updated_at
`;

const normalizeLimit = (limit) => {
  const parsedLimit = Number.parseInt(limit, 10);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_RECOMMENDATION_LIMIT;
  }

  return Math.max(
    MIN_RECOMMENDATION_LIMIT,
    Math.min(parsedLimit, MAX_RECOMMENDATION_LIMIT)
  );
};

const normalizeScore = (score) => {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return 0;
  }

  return Math.max(0, Math.min(1, numericScore));
};

const calculateHybridScore = (cbfScore = 0, cfScore = 0) => {
  return (
    HYBRID_WEIGHTS.contentBased * normalizeScore(cbfScore) +
    HYBRID_WEIGHTS.collaborativeFiltering * normalizeScore(cfScore)
  );
};

const mapColdStartProduct = (product) => {
  return {
    id: product.id,
    name: product.name,
    image_url: product.image_url,
    category: product.category,
    material: product.material,
    style_theme: product.style_theme,
    dominant_color: product.dominant_color,
    room_category: product.room_category,
    description: product.description,
    price: product.price,
    stock: product.stock,
    status: product.status,
    score: 0,
    final_score: 0
  };
};

const mapHybridProduct = (product, cbfScore, cfScore, finalScore) => {
  const productId = product.id || product.product_id;

  return {
    id: productId,
    product_id: productId,
    name: product.name,
    image_url: product.image_url,
    category: product.category,
    material: product.material,
    style_theme: product.style_theme,
    dominant_color: product.dominant_color,
    room_category: product.room_category,
    description: product.description,
    price: product.price,
    stock: product.stock,
    status: product.status,
    cbf_score: Number(cbfScore.toFixed(6)),
    cf_score: Number(cfScore.toFixed(6)),
    final_score: Number(finalScore.toFixed(6))
  };
};

const mergeRecommendationScores = (cbfRecommendations = [], cfRecommendations = []) => {
  /**
   * Hybrid engine menggabungkan dua sudut pandang:
   * - CBF membaca kemiripan atribut produk.
   * - CF membaca pola perilaku user lain.
   *
   * Produk digabung berdasarkan product id agar produk yang muncul di kedua
   * algoritma mendapatkan skor dari dua sumber, sedangkan produk yang hanya
   * muncul di salah satu algoritma tetap bisa dipertimbangkan.
   */
  const productsById = new Map();

  cbfRecommendations.forEach((item) => {
    const productId = item.id || item.product_id;

    if (!productId) {
      return;
    }

    productsById.set(String(productId), {
      product: item,
      cbf_score: normalizeScore(item.score ?? item.cbf_score),
      cf_score: 0
    });
  });

  cfRecommendations.forEach((item) => {
    const rawProductId = item.id || item.product_id;

    if (!rawProductId) {
      return;
    }

    const productId = String(rawProductId);
    const existing = productsById.get(productId);

    if (existing) {
      existing.cf_score = normalizeScore(item.score ?? item.cf_score);
      return;
    }

    productsById.set(productId, {
      product: item,
      cbf_score: 0,
      cf_score: normalizeScore(item.score ?? item.cf_score)
    });
  });

  return Array.from(productsById.values())
    .map((item) => {
      /**
       * Jika skor dari salah satu algoritma tidak tersedia, nilainya dianggap 0.
       * Formula wajib:
       *
       * Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
       *
       * CBF diberi bobot 0.7 karena produk interior sangat dipengaruhi atribut
       * konten seperti kategori, material, style, warna, dan ruangan.
       * CF diberi bobot 0.3 agar pola perilaku user lain tetap menjadi faktor
       * pendukung tanpa mengalahkan kesesuaian karakteristik produk.
       */
      const finalScore = calculateHybridScore(item.cbf_score, item.cf_score);

      return mapHybridProduct(
        item.product,
        item.cbf_score,
        item.cf_score,
        finalScore
      );
    })
    .sort((productA, productB) => {
      if (productB.final_score !== productA.final_score) {
        return productB.final_score - productA.final_score;
      }

      return String(productA.name || '').localeCompare(String(productB.name || ''));
    });
};

const getColdStartRecommendations = async (limit = 10) => {
  const normalizedLimit = normalizeLimit(limit);
  const popularResult = await query(
    `
      SELECT *
      FROM popular_products
      ORDER BY popularity_score DESC, total_interactions DESC
      LIMIT $1
    `,
    [normalizedLimit]
  );

  if (popularResult.rows.length > 0) {
    return {
      recommendations: popularResult.rows.map(mapColdStartProduct),
      meta: {
        algorithm: 'cold-start',
        limit: normalizedLimit,
        strategy: 'popular-products-then-random'
      }
    };
  }

  const randomResult = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE status = 'active'
      ORDER BY RANDOM()
      LIMIT $1
    `,
    [normalizedLimit]
  );

  return {
    recommendations: randomResult.rows.map(mapColdStartProduct),
    meta: {
      algorithm: 'cold-start',
      limit: normalizedLimit,
      strategy: 'popular-products-then-random'
    }
  };
};

const getPersonalRecommendationsOnly = (result) => {
  if (!result || !Array.isArray(result.recommendations)) {
    return [];
  }

  if (!result.meta || !result.meta.fallback_used) {
    return result.recommendations;
  }

  if (result.meta.scoring_method === 'implicit_preference_score') {
    return result.recommendations.filter((recommendation) => {
      return recommendation.recommendation_source === 'user_based_cf';
    });
  }

  return [];
};

const appendColdStartProducts = async (recommendations, limit) => {
  if (recommendations.length >= limit) {
    return [];
  }

  /**
   * Cold-start penting agar sistem tetap stabil ketika data personal kurang.
   * Daripada endpoint error atau kosong, sistem tetap bisa menampilkan produk
   * populer/random sebagai rekomendasi awal.
   */
  const coldStart = await getColdStartRecommendations(limit * 2);
  const existingIds = new Set(recommendations.map((item) => String(item.id)));
  const appended = [];

  for (const product of coldStart.recommendations) {
    if (existingIds.has(String(product.id))) {
      continue;
    }

    appended.push({
      id: product.id,
      name: product.name,
      image_url: product.image_url,
      category: product.category,
      material: product.material,
      style_theme: product.style_theme,
      dominant_color: product.dominant_color,
      room_category: product.room_category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
      cbf_score: 0,
      cf_score: 0,
      final_score: 0
    });
    existingIds.add(String(product.id));

    if (recommendations.length + appended.length >= limit) {
      break;
    }
  }

  return appended;
};

const getHybridRecommendations = async (userId, limit = 10) => {
  const normalizedLimit = normalizeLimit(limit);
  const [cbfResult, cfResult] = await Promise.all([
    contentBasedService.getContentBasedRecommendations(userId, normalizedLimit),
    userBasedService.getUserBasedRecommendations(userId, normalizedLimit)
  ]);
  const cbfPersonalRecommendations = getPersonalRecommendationsOnly(cbfResult);
  const cfPersonalRecommendations = getPersonalRecommendationsOnly(cfResult);

  let mergedRecommendations = mergeRecommendationScores(
    cbfPersonalRecommendations,
    cfPersonalRecommendations
  );
  let fallbackUsed = false;
  let reason = null;

  if (mergedRecommendations.length === 0) {
    const coldStart = await getColdStartRecommendations(normalizedLimit);

    return {
      recommendations: coldStart.recommendations.map((product) => {
        return {
          ...product,
          cbf_score: 0,
          cf_score: 0,
          final_score: 0
        };
      }),
      meta: {
        algorithm: 'hybrid-recommendation',
        user_id: userId,
        limit: normalizedLimit,
        fallback_used: true,
        reason: 'No personalized recommendation candidates available',
        weights: HYBRID_WEIGHTS,
        cf_scoring_method: cfResult.meta
          ? cfResult.meta.scoring_method
          : 'implicit_preference_score',
        cf_score_normalized: true,
        page_view_used_for_cf: false,
        cbf_count: cbfPersonalRecommendations.length,
        cf_count: cfPersonalRecommendations.length,
        hybrid_count: coldStart.recommendations.length
      }
    };
  }

  mergedRecommendations = mergedRecommendations.slice(0, normalizedLimit);

  if (mergedRecommendations.length < normalizedLimit) {
    const appendedColdStart = await appendColdStartProducts(
      mergedRecommendations,
      normalizedLimit
    );

    if (appendedColdStart.length > 0) {
      fallbackUsed = true;
      reason = 'Cold-start fallback used';
      mergedRecommendations = [
        ...mergedRecommendations,
        ...appendedColdStart
      ].slice(0, normalizedLimit);
    }
  }

  if (cbfPersonalRecommendations.length === 0 && cfPersonalRecommendations.length > 0) {
    reason = reason || 'Content-based recommendations unavailable';
  }

  if (cfPersonalRecommendations.length === 0 && cbfPersonalRecommendations.length > 0) {
    reason = reason || 'Collaborative filtering recommendations unavailable';
  }

  return {
    recommendations: mergedRecommendations,
    meta: {
      algorithm: 'hybrid-recommendation',
      user_id: userId,
      limit: normalizedLimit,
      fallback_used: fallbackUsed,
      reason,
      weights: HYBRID_WEIGHTS,
      cf_scoring_method: cfResult.meta
        ? cfResult.meta.scoring_method
        : 'implicit_preference_score',
      cf_score_normalized: true,
      page_view_used_for_cf: false,
      cbf_count: cbfPersonalRecommendations.length,
      cf_count: cfPersonalRecommendations.length,
      hybrid_count: mergedRecommendations.length
    }
  };
};

const getPersonalRecommendations = async (userId, limit = 10) => {
  return getHybridRecommendations(userId, limit);
};

module.exports = {
  normalizeLimit,
  normalizeScore,
  calculateHybridScore,
  mergeRecommendationScores,
  getColdStartRecommendations,
  getHybridRecommendations,
  getPersonalRecommendations
};

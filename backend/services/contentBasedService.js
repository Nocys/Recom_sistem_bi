const { query } = require('../config/db');
const { cosineSimilarity } = require('../utils/math');
const {
  createMetadataSoup,
  tokenize
} = require('../utils/textProcessing');

const DEFAULT_RECOMMENDATION_LIMIT = 10;
const MAX_RECOMMENDATION_LIMIT = 10;
const MIN_RECOMMENDATION_LIMIT = 5;
const DEFAULT_BASIS_PRODUCT_LIMIT = 5;

const PRODUCT_SELECT_FIELDS = `
  id,
  name,
  image_url,
  category,
  material,
  material_variant,
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

const mapRecommendationProduct = (product, score = 0) => {
  const numericScore = Number(score);

  return {
    id: product.id,
    name: product.name,
    image_url: product.image_url,
    category: product.category,
    material: product.material,
    material_variant: product.material_variant,
    style_theme: product.style_theme,
    dominant_color: product.dominant_color,
    room_category: product.room_category,
    description: product.description,
    price: product.price,
    stock: product.stock,
    status: product.status,
    score: Number((Number.isFinite(numericScore) ? numericScore : 0).toFixed(6))
  };
};

const getActiveProducts = async () => {
  const result = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE status = 'active'
      ORDER BY created_at DESC
    `
  );

  return result.rows;
};

const getUserTopInteractedProducts = async (
  userId,
  limit = DEFAULT_BASIS_PRODUCT_LIMIT
) => {
  const result = await query(
    `
      SELECT
        p.*,
        upr.implicit_rating,
        upr.interaction_count,
        upr.last_interaction_at
      FROM user_product_ratings upr
      JOIN products p ON p.id = upr.product_id
      WHERE upr.user_id = $1
        AND p.status = 'active'
      ORDER BY upr.implicit_rating DESC, upr.last_interaction_at DESC
      LIMIT $2
    `,
    [userId, limit]
  );

  return result.rows;
};

const getUserInteractedProductIds = async (userId) => {
  const result = await query(
    `
      SELECT DISTINCT product_id
      FROM interactions
      WHERE user_id = $1
    `,
    [userId]
  );

  return new Set(result.rows.map((row) => String(row.product_id)));
};

const calculateTermFrequency = (tokens) => {
  /**
   * Term Frequency (TF) menghitung proporsi kemunculan suatu token dalam satu
   * dokumen produk.
   *
   * TF(term) = jumlah kemunculan term dalam dokumen / total token dokumen
   *
   * Jika "kayu" muncul 2 kali dari 5 token, TF(kayu) = 2 / 5 = 0.4.
   * Nilai ini membuat token yang lebih sering muncul pada metadata soup suatu
   * produk memiliki pengaruh lebih besar pada vector produk tersebut.
   */
  if (!tokens || tokens.length === 0) {
    return {};
  }

  const counts = tokens.reduce((result, token) => {
    result[token] = (result[token] || 0) + 1;
    return result;
  }, {});

  return Object.keys(counts).reduce((termFrequency, token) => {
    termFrequency[token] = counts[token] / tokens.length;
    return termFrequency;
  }, {});
};

const calculateInverseDocumentFrequency = (documents) => {
  /**
   * Inverse Document Frequency (IDF) mengukur seberapa unik token pada seluruh
   * koleksi produk aktif.
   *
   * IDF(term) = log((N + 1) / (DF(term) + 1)) + 1
   *
   * N adalah jumlah dokumen produk.
   * DF(term) adalah jumlah dokumen yang mengandung term tersebut.
   * +1 pada N dan DF adalah smoothing agar tidak ada pembagian nol.
   * +1 di akhir menjaga IDF tetap positif sehingga token umum masih punya
   * bobot kecil, bukan nol.
   */
  const documentCount = documents.length;
  const documentFrequency = {};

  documents.forEach((tokens) => {
    const uniqueTokens = new Set(tokens);

    uniqueTokens.forEach((token) => {
      documentFrequency[token] = (documentFrequency[token] || 0) + 1;
    });
  });

  return Object.keys(documentFrequency).reduce((idfMap, token) => {
    idfMap[token] =
      Math.log((documentCount + 1) / (documentFrequency[token] + 1)) + 1;
    return idfMap;
  }, {});
};

const buildVocabulary = (documents) => {
  /**
   * Vocabulary adalah daftar token unik dari semua produk aktif.
   * Array diurutkan agar posisi setiap token konsisten pada semua vector.
   * Tanpa posisi yang konsisten, dimensi vector antarproduk tidak bisa
   * dibandingkan secara matematis.
   */
  const vocabulary = new Set();

  documents.forEach((tokens) => {
    tokens.forEach((token) => vocabulary.add(token));
  });

  return Array.from(vocabulary).sort();
};

const buildTfIdfVector = (tokens, vocabulary, idfMap) => {
  const termFrequency = calculateTermFrequency(tokens);

  return vocabulary.map((token) => {
    /**
     * TF-IDF(term) = TF(term) x IDF(term)
     *
     * Posisi vector mengikuti vocabulary global. Ini penting agar cosine
     * similarity membandingkan dimensi token yang sama, misalnya posisi token
     * "kayu" selalu dibandingkan dengan token "kayu" pada produk lain.
     */
    return (termFrequency[token] || 0) * (idfMap[token] || 0);
  });
};

const buildTfIdfVectors = (products) => {
  const tokensByProductId = {};

  const documents = products.map((product) => {
    const metadataSoup = createMetadataSoup(product);
    const tokens = tokenize(metadataSoup);
    tokensByProductId[String(product.id)] = tokens;
    return tokens;
  });

  const vocabulary = buildVocabulary(documents);
  const idfMap = calculateInverseDocumentFrequency(documents);
  const vectorsByProductId = {};

  products.forEach((product) => {
    const productId = String(product.id);
    vectorsByProductId[productId] = buildTfIdfVector(
      tokensByProductId[productId],
      vocabulary,
      idfMap
    );
  });

  return {
    vocabulary,
    idfMap,
    vectorsByProductId,
    tokensByProductId
  };
};

const calculateProductSimilarity = (productA, productB, tfidfData) => {
  const vectorA = tfidfData.vectorsByProductId[String(productA.id)] || [];
  const vectorB = tfidfData.vectorsByProductId[String(productB.id)] || [];

  return cosineSimilarity(vectorA, vectorB);
};

const getFallbackProducts = async (limit) => {
  const popularResult = await query(
    `
      SELECT *
      FROM popular_products
      ORDER BY popularity_score DESC, total_interactions DESC
      LIMIT $1
    `,
    [limit]
  );

  if (popularResult.rows.length > 0) {
    return popularResult.rows;
  }

  const randomResult = await query(
    `
      SELECT ${PRODUCT_SELECT_FIELDS}
      FROM products
      WHERE status = 'active'
      ORDER BY RANDOM()
      LIMIT $1
    `,
    [limit]
  );

  return randomResult.rows;
};

const appendFallbackRecommendations = async ({
  recommendations,
  interactedProductIds,
  limit
}) => {
  if (recommendations.length >= limit) {
    return [];
  }

  const existingIds = new Set(recommendations.map((product) => String(product.id)));
  const fallbackProducts = await getFallbackProducts(limit * 2);
  const appended = [];

  for (const product of fallbackProducts) {
    const productId = String(product.id);

    if (existingIds.has(productId) || interactedProductIds.has(productId)) {
      continue;
    }

    appended.push(mapRecommendationProduct(product, 0));
    existingIds.add(productId);

    if (recommendations.length + appended.length >= limit) {
      break;
    }
  }

  return appended;
};

const getContentBasedRecommendations = async (userId, limit = 10) => {
  const normalizedLimit = normalizeLimit(limit);
  const activeProducts = await getActiveProducts();

  if (activeProducts.length === 0) {
    return {
      recommendations: [],
      meta: {
        algorithm: 'content-based-filtering',
        user_id: userId,
        limit: normalizedLimit,
        fallback_used: true,
        reason: 'No active products available',
        basis_product_count: 0,
        total_candidates: 0
      }
    };
  }

  const basisProducts = await getUserTopInteractedProducts(
    userId,
    DEFAULT_BASIS_PRODUCT_LIMIT
  );

  if (basisProducts.length === 0) {
    const fallbackProducts = await getFallbackProducts(normalizedLimit);

    return {
      recommendations: fallbackProducts.map((product) => {
        return mapRecommendationProduct(product, product.popularity_score || 0);
      }),
      meta: {
        algorithm: 'content-based-filtering',
        user_id: userId,
        limit: normalizedLimit,
        fallback_used: true,
        reason: 'No user interaction history available',
        basis_product_count: 0,
        total_candidates: activeProducts.length
      }
    };
  }

  const interactedProductIds = await getUserInteractedProductIds(userId);
  const tfidfData = buildTfIdfVectors(activeProducts);
  const candidates = activeProducts.filter((product) => {
    return !interactedProductIds.has(String(product.id));
  });

  /**
   * Produk yang sudah pernah diinteraksi user tidak direkomendasikan ulang.
   * Tujuannya agar endpoint ini membantu discovery produk baru, sementara
   * produk lama tetap tersedia melalui history dan ratings.
   */
  const scoredCandidates = candidates
    .map((candidate) => {
      /**
       * score(candidate) = max cosine_similarity(candidate, each basis product)
       *
       * Pendekatan skor maksimum berarti kandidat direkomendasikan jika ia
       * sangat mirip dengan minimal satu produk yang kuat dalam riwayat user.
       * Ini lebih mudah dijelaskan daripada membuat weighted profile vector.
       */
      const score = basisProducts.reduce((maxScore, basisProduct) => {
        const similarity = calculateProductSimilarity(
          candidate,
          basisProduct,
          tfidfData
        );

        return Math.max(maxScore, similarity);
      }, 0);

      return mapRecommendationProduct(candidate, score);
    })
    .filter((candidate) => candidate.score > 0)
    .sort((productA, productB) => {
      if (productB.score !== productA.score) {
        return productB.score - productA.score;
      }

      return productA.name.localeCompare(productB.name);
    });

  const recommendations = scoredCandidates.slice(0, normalizedLimit);
  const appendedFallback = await appendFallbackRecommendations({
    recommendations,
    interactedProductIds,
    limit: normalizedLimit
  });
  const finalRecommendations = [...recommendations, ...appendedFallback].slice(
    0,
    normalizedLimit
  );
  const fallbackUsed =
    appendedFallback.length > 0 || finalRecommendations.length < normalizedLimit;
  let reason = null;

  if (appendedFallback.length > 0) {
    reason = 'Not enough content-similar candidates available';
  } else if (candidates.length === 0) {
    reason = 'No candidate products available';
  } else if (finalRecommendations.length < normalizedLimit) {
    reason = 'Not enough recommended products available';
  }

  return {
    recommendations: finalRecommendations,
    meta: {
      algorithm: 'content-based-filtering',
      user_id: userId,
      limit: normalizedLimit,
      fallback_used: fallbackUsed,
      reason,
      basis_product_count: basisProducts.length,
      total_candidates: candidates.length
    }
  };
};

module.exports = {
  getActiveProducts,
  getUserTopInteractedProducts,
  getUserInteractedProductIds,
  calculateTermFrequency,
  calculateInverseDocumentFrequency,
  buildVocabulary,
  buildTfIdfVector,
  buildTfIdfVectors,
  calculateProductSimilarity,
  getFallbackProducts,
  getContentBasedRecommendations
};

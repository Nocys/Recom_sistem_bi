function normalizeVector(vector) {
  return Array.isArray(vector) ? vector : [];
}

function toFiniteNumber(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function dotProduct(vectorA, vectorB) {
  /**
   * Dot product mengukur jumlah hasil perkalian elemen pada posisi yang sama.
   * Dalam konteks TF-IDF, dot product menunjukkan seberapa banyak dua produk
   * memiliki token metadata yang sama dengan bobot yang sama-sama tinggi.
   */
  const safeVectorA = normalizeVector(vectorA);
  const safeVectorB = normalizeVector(vectorB);
  const length = Math.min(safeVectorA.length, safeVectorB.length);
  let result = 0;

  for (let index = 0; index < length; index += 1) {
    result +=
      toFiniteNumber(safeVectorA[index]) * toFiniteNumber(safeVectorB[index]);
  }

  return result;
}

function vectorMagnitude(vector) {
  /**
   * Magnitude adalah panjang vector:
   * ||A|| = sqrt(a1^2 + a2^2 + ... + an^2)
   *
   * Pada TF-IDF, magnitude menormalkan ukuran vector agar produk dengan jumlah
   * token lebih banyak tidak otomatis terlihat lebih mirip hanya karena punya
   * lebih banyak nilai.
   */
  const safeVector = normalizeVector(vector);

  if (safeVector.length === 0) {
    return 0;
  }

  const squaredSum = safeVector.reduce((sum, value) => {
    const numericValue = toFiniteNumber(value);

    return sum + numericValue * numericValue;
  }, 0);

  return Math.sqrt(squaredSum);
}

function cosineSimilarity(vectorA, vectorB) {
  /**
   * Cosine Similarity:
   * cosine_similarity(A, B) = dot(A, B) / (||A|| x ||B||)
   *
   * Nilai 1 berarti arah vector sama atau sangat mirip, nilai 0 berarti tidak
   * ada token berbobot yang sama. Karena TF-IDF pada proyek ini non-negatif,
   * skor berada pada rentang 0 sampai 1.
   *
   * Fungsi yang sama dipakai untuk dua konteks:
   * 1. Content-Based Filtering: vector berisi bobot TF-IDF metadata produk.
   * 2. User-Based Collaborative Filtering: vector berisi implicit preference
   *    score user terhadap produk pada product vocabulary yang sama.
   */
  const safeVectorA = normalizeVector(vectorA);
  const safeVectorB = normalizeVector(vectorB);

  if (safeVectorA.length === 0 || safeVectorB.length === 0) {
    return 0;
  }

  const magnitudeA = vectorMagnitude(safeVectorA);
  const magnitudeB = vectorMagnitude(safeVectorB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  const score = dotProduct(safeVectorA, safeVectorB) / (magnitudeA * magnitudeB);

  return Math.max(0, Math.min(1, score));
}

module.exports = {
  normalizeVector,
  dotProduct,
  vectorMagnitude,
  cosineSimilarity
};

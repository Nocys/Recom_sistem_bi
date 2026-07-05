/**
 * Text Processing Utilities for Content-Based Filtering
 *
 * Recommendation metadata berasal dari field terstruktur produk, bukan dari
 * deskripsi bebas. Field tersebut digabung menjadi "metadata soup" supaya
 * setiap produk bisa diperlakukan sebagai satu dokumen teks pendek.
 */

function normalizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  /**
   * Token adalah unit kata yang akan dihitung pada TF-IDF.
   * Normalisasi dilakukan sebelum tokenisasi agar variasi penulisan seperti
   * "Kayu-Oak", "kayu oak", dan "KAYU OAK" diperlakukan konsisten.
   */
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  return normalizedText.split(' ').filter(Boolean);
}

function createMetadataSoup(product) {
  /**
   * Metadata soup hanya memakai atribut terstruktur:
   * category, material, material_variant, style_theme, dominant_color,
   * dan room_category.
   *
   * Description sengaja tidak dipakai pada Bagian 7 agar rekomendasi fokus
   * pada karakteristik interior yang stabil dan mudah dijelaskan secara
   * akademik.
   */
  const materialVariant =
    product.material_variant && product.material_variant !== 'Tidak Ada'
      ? product.material_variant
      : null;

  return [
    product.category,
    product.material,
    materialVariant,
    product.style_theme,
    product.dominant_color,
    product.room_category
  ]
    .filter(Boolean)
    .join(' ');
}

module.exports = {
  normalizeText,
  tokenize,
  createMetadataSoup
};

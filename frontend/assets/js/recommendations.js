async function fetchColdStartRecommendations(limit = 10) {
  const response = await apiRequest(`/recommendations/cold-start${buildQueryString({ limit })}`);
  return response.data;
}

async function fetchPersonalRecommendations(limit = 10) {
  const response = await apiRequest(`/recommendations/personal${buildQueryString({ limit })}`);
  return response.data;
}

async function fetchContentBasedRecommendations(limit = 10) {
  const response = await apiRequest(`/recommendations/content-based${buildQueryString({ limit })}`);
  return response.data;
}

async function fetchUserBasedRecommendations(limit = 10) {
  const response = await apiRequest(`/recommendations/user-based${buildQueryString({ limit })}`);
  return response.data;
}

async function fetchHybridRecommendations(limit = 10) {
  const response = await apiRequest(`/recommendations/hybrid${buildQueryString({ limit })}`);
  return response.data;
}

async function fetchRoomComplementaryRecommendations(productId, limit = 6) {
  const response = await apiRequest(
    `/recommendations/room-complementary/${encodeURIComponent(productId)}${buildQueryString({ limit })}`
  );
  return response.data && Array.isArray(response.data.recommendations)
    ? response.data.recommendations
    : [];
}

async function fetchMyInteractionSummary() {
  const response = await apiRequest('/interactions/my-summary');
  return response.data.summary;
}

async function fetchMyInteractionHistory() {
  const response = await apiRequest('/interactions/my-history?limit=20&offset=0');
  return response.data;
}

async function fetchMyRatings() {
  const response = await apiRequest('/interactions/my-ratings');
  return response.data.ratings;
}

function formatScore(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(3) : '0.000';
}

function renderScoreBlock(product, algorithm) {
  if (algorithm === 'hybrid') {
    return `
      <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div class="rounded-md border border-blue-200 bg-blue-50 p-2 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">CBF<br><strong>${formatScore(product.cbf_score)}</strong></div>
        <div class="rounded-md border border-purple-200 bg-purple-50 p-2 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">CF<br><strong>${formatScore(product.cf_score)}</strong></div>
        <div class="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">Final<br><strong>${formatScore(product.final_score)}</strong></div>
      </div>
    `;
  }

  if (algorithm === 'content-based') {
    return `<div class="mt-3 inline-flex rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">Similarity Score: <strong class="ml-1">${formatScore(product.score)}</strong></div>`;
  }

  if (algorithm === 'user-based') {
    return `<div class="mt-3 inline-flex rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">CF Score: <strong class="ml-1">${formatScore(product.score)}</strong></div>`;
  }

  return '';
}

function renderRecommendationCard(product, algorithm) {
  return `
    <article class="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
      <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="block overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img src="${escapeHtml(getProductImageUrl(product.image_url))}" alt="${escapeHtml(product.name)}" class="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" onerror="handleImageError(this)" />
      </a>
      <div class="flex flex-1 flex-col p-4">
        <div class="inline-flex w-fit rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-200">${escapeHtml(product.category)}</div>
        <h3 class="mt-2 line-clamp-2 min-h-[3rem] text-base font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(product.name)}</h3>
        <div class="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">${formatRupiah(product.price)}</div>
        ${renderScoreBlock(product, algorithm)}
        <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-stone-900 px-3 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
          Detail Produk
        </a>
      </div>
    </article>
  `;
}

function formatRecommendationMaterial(product) {
  const material = product && product.material ? product.material : 'Material belum diisi';
  const variant = product && product.material_variant ? product.material_variant : 'Tidak Ada';

  if (variant === 'Tidak Ada') {
    return material;
  }

  return `${material} ${variant}`;
}

function getRoomComplementaryProduct(item) {
  return item && item.product ? item.product : item;
}

function renderRoomComplementaryCard(item) {
  const product = getRoomComplementaryProduct(item);
  const material = formatRecommendationMaterial(product);

  return `
    <article class="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
      <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="block overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img src="${escapeHtml(getProductImageUrl(product.image_url))}" alt="${escapeHtml(product.name)}" class="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" onerror="handleImageError(this)" />
      </a>
      <div class="flex flex-1 flex-col p-3">
        <span class="inline-flex w-fit rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-200">${escapeHtml(product.category || '-')}</span>
        <h3 class="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-stone-900 dark:text-stone-100">${escapeHtml(product.name)}</h3>
        <p class="mt-2 line-clamp-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(material)}</p>
        <p class="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">${formatRupiah(product.price)}</p>
        <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-stone-900 px-3 text-xs font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
          Lihat Detail
        </a>
      </div>
    </article>
  `;
}

function renderRoomComplementaryShell(contentHtml) {
  return `
    <section class="rounded-lg border border-stone-200 bg-white p-5 text-stone-900 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
      <div>
        <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">Sangat Disarankan untuk Pelengkap Ruangan Anda</h2>
        <p class="mt-1 text-sm text-stone-600 dark:text-stone-300">Pilihan produk yang dapat melengkapi tampilan ruangan berdasarkan kategori ruangan produk ini.</p>
      </div>
      ${contentHtml}
    </section>
  `;
}

function renderRoomComplementaryLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = renderRoomComplementaryShell(`
    <div class="mt-5 rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
      Memuat produk pelengkap ruangan...
    </div>
    <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      ${createLoadingCards(6)}
    </div>
  `);
}

function renderRoomComplementaryRecommendations(containerId, recommendations) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = Array.isArray(recommendations) ? recommendations.slice(0, 6) : [];

  if (items.length === 0) {
    container.innerHTML = renderRoomComplementaryShell(`
      <div class="mt-5">
        ${renderEmptyState('Belum ada produk pelengkap untuk ruangan ini.')}
      </div>
    `);
    return;
  }

  container.innerHTML = renderRoomComplementaryShell(`
    <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      ${items.map(renderRoomComplementaryCard).join('')}
    </div>
  `);
}

function renderRoomComplementaryError(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = renderRoomComplementaryShell(`
    <div class="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      Gagal memuat rekomendasi pelengkap ruangan.
    </div>
  `);
}

async function loadRoomComplementarySection(productId) {
  const containerId = 'room-complementary-recommendations';
  const container = document.getElementById(containerId);
  if (!container) return;

  renderRoomComplementaryLoading(containerId);

  try {
    const recommendations = await fetchRoomComplementaryRecommendations(productId, 6);
    renderRoomComplementaryRecommendations(containerId, recommendations);
  } catch (error) {
    renderRoomComplementaryError(containerId);
  }
}

function getRecommendationItems(result) {
  return result && Array.isArray(result.recommendations) ? result.recommendations : [];
}

function normalizeRecommendationProduct(item) {
  if (!item) return null;

  const product = item.product || item;
  const productId = product.id || product.product_id || item.id || item.product_id;

  if (!productId) {
    return null;
  }

  return {
    id: productId,
    product_id: productId,
    name: product.name || item.name || '',
    image_url: product.image_url || item.image_url || '',
    category: product.category || item.category || '',
    material: product.material || item.material || '',
    material_variant: product.material_variant || item.material_variant || 'Tidak Ada',
    style_theme: product.style_theme || item.style_theme || '',
    dominant_color: product.dominant_color || item.dominant_color || '',
    room_category: product.room_category || item.room_category || '',
    price: product.price ?? item.price ?? 0,
    stock: product.stock ?? item.stock ?? null,
    status: product.status || item.status || 'active'
  };
}

function mergeInspirationRecommendations(
  cbfItems = [],
  hybridItems = [],
  fallbackItems = [],
  currentProductId
) {
  const merged = [];
  const seenIds = new Set([String(currentProductId)]);

  const addItems = (items, sourceLimit, maxTotal = 6) => {
    let addedFromSource = 0;

    (items || []).forEach((item) => {
      if (merged.length >= maxTotal || addedFromSource >= sourceLimit) return;

      const product = normalizeRecommendationProduct(item);
      if (!product) return;

      const productId = String(product.id);
      if (seenIds.has(productId)) return;

      seenIds.add(productId);
      merged.push(product);
      addedFromSource += 1;
    });
  };

  addItems(cbfItems, 3, 5);
  addItems(hybridItems, 2, 5);
  addItems(fallbackItems, 6, 6);

  return merged.slice(0, 6);
}

async function fetchInspirationRecommendations(currentProductId) {
  const authState = currentAuthState || (typeof getCurrentUser === 'function'
    ? await getCurrentUser()
    : { authenticated: false });
  const authenticated = Boolean(authState && authState.authenticated);

  if (!authenticated) {
    const fallbackResult = await fetchColdStartRecommendations(6);
    return mergeInspirationRecommendations(
      [],
      [],
      getRecommendationItems(fallbackResult),
      currentProductId
    );
  }

  const [cbfResult, hybridResult, fallbackResult] = await Promise.allSettled([
    fetchContentBasedRecommendations(3),
    fetchHybridRecommendations(2),
    fetchColdStartRecommendations(6)
  ]);

  const cbfItems = cbfResult.status === 'fulfilled' ? getRecommendationItems(cbfResult.value) : [];
  const hybridItems = hybridResult.status === 'fulfilled' ? getRecommendationItems(hybridResult.value) : [];
  const fallbackItems =
    fallbackResult.status === 'fulfilled' ? getRecommendationItems(fallbackResult.value) : [];

  if (
    cbfResult.status === 'rejected' &&
    hybridResult.status === 'rejected' &&
    fallbackResult.status === 'rejected'
  ) {
    throw new Error('Unable to load inspiration recommendations');
  }

  return mergeInspirationRecommendations(
    cbfItems,
    hybridItems,
    fallbackItems,
    currentProductId
  );
}

function fetchProductDetailRecommendations(currentProductId) {
  return fetchInspirationRecommendations(currentProductId);
}

function renderInspirationShell(contentHtml) {
  return `
    <section class="rounded-lg border border-stone-200 bg-white p-5 text-stone-900 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
      <div>
        <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">Inspirasi Produk Lainnya</h2>
        <p class="mt-1 text-sm text-stone-600 dark:text-stone-300">Temukan pilihan produk lain yang mungkin sesuai dengan gaya dan kebutuhan interior Anda.</p>
      </div>
      ${contentHtml}
    </section>
  `;
}

function renderInspirationRecommendationLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = renderInspirationShell(`
    <div class="mt-5 rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
      Memuat inspirasi produk lainnya...
    </div>
    <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      ${createLoadingCards(6)}
    </div>
  `);
}

function renderInspirationRecommendationCard(product) {
  const material = formatRecommendationMaterial(product);

  return `
    <article class="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
      <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="block overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img src="${escapeHtml(getProductImageUrl(product.image_url))}" alt="${escapeHtml(product.name)}" class="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" onerror="handleImageError(this)" />
      </a>
      <div class="flex flex-1 flex-col p-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-200">${escapeHtml(product.category || '-')}</span>
        </div>
        <h3 class="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-stone-900 dark:text-stone-100">${escapeHtml(product.name)}</h3>
        <p class="mt-2 line-clamp-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(material)}</p>
        <p class="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">${formatRupiah(product.price)}</p>
        <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">
          Lihat Detail
        </a>
      </div>
    </article>
  `;
}

function renderInspirationRecommendations(containerId, recommendations, currentProductId = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentId = currentProductId ? String(currentProductId) : '';
  const seenIds = new Set(currentId ? [currentId] : []);
  const items = (Array.isArray(recommendations) ? recommendations : [])
    .map(normalizeRecommendationProduct)
    .filter((product) => {
      if (!product) return false;

      const productId = String(product.id);
      if (seenIds.has(productId)) return false;

      seenIds.add(productId);
      return true;
    })
    .slice(0, 6);

  if (items.length === 0) {
    container.innerHTML = renderInspirationShell(`
      <div class="mt-5 rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p class="text-sm font-semibold text-stone-900 dark:text-stone-100">Belum ada inspirasi produk lainnya.</p>
        <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">Coba lihat produk lain untuk mendapatkan referensi yang lebih beragam.</p>
      </div>
    `);
    return;
  }

  container.innerHTML = renderInspirationShell(`
    <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      ${items.map(renderInspirationRecommendationCard).join('')}
    </div>
  `);
}

function renderInspirationError(containerId, currentProductId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = renderInspirationShell(`
    <div class="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      <p class="font-semibold">Gagal memuat inspirasi produk lainnya.</p>
      <button type="button" data-inspiration-retry class="mt-4 inline-flex h-9 items-center rounded-md border border-red-300 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900">
        Coba Lagi
      </button>
    </div>
  `);

  const retryButton = container.querySelector('[data-inspiration-retry]');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      loadInspirationRecommendationSection(currentProductId);
    });
  }
}

function renderProductDetailRecommendations(containerId, recommendations, currentProductId = '') {
  return renderInspirationRecommendations(containerId, recommendations, currentProductId);
}

async function loadInspirationRecommendationSection(currentProductId) {
  const containerId = 'product-detail-recommendations';
  const container = document.getElementById(containerId);
  if (!container) return;

  renderInspirationRecommendationLoading(containerId);

  try {
    const recommendations = await fetchInspirationRecommendations(currentProductId);
    renderInspirationRecommendations(containerId, recommendations, currentProductId);
  } catch (error) {
    renderInspirationError(containerId, currentProductId);
  }
}

async function loadProductDetailRecommendationSection(currentProductId) {
  return loadInspirationRecommendationSection(currentProductId);
}

function renderRecommendationSection(containerId, title, description, result, algorithm) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const recommendations = result && Array.isArray(result.recommendations)
    ? result.recommendations
    : [];
  const meta = result && result.meta ? result.meta : null;
  const statusText = meta && meta.fallback_used
    ? 'Recommendation Source: Fallback'
    : 'Recommendation Source: Personalized';
  const fallbackMessage =
    'Data interaksi Anda masih sedikit, sehingga sistem menampilkan fallback produk populer. Setelah Anda melihat, menyukai, atau menyimpan produk ke wishlist, rekomendasi akan menjadi lebih personal.';

  if (recommendations.length === 0) {
    container.innerHTML = `
      <div class="mb-4">
        <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(title)}</h2>
        <p class="mt-1 text-sm text-stone-600 dark:text-stone-300">${escapeHtml(description)}</p>
      </div>
      ${renderEmptyState(fallbackMessage)}
    `;
    return;
  }

  container.innerHTML = `
    <div class="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
      <div>
        <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(title)}</h2>
        <p class="mt-1 text-sm text-stone-600 dark:text-stone-300">${escapeHtml(description)}</p>
      </div>
      <span class="inline-flex w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-200">${statusText}</span>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      ${recommendations.slice(0, 8).map((product) => renderRecommendationCard(product, algorithm)).join('')}
    </div>
    ${meta && meta.fallback_used ? `<p class="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">${fallbackMessage}</p>` : ''}
    ${meta && meta.reason ? `<p class="mt-3 text-xs text-stone-500 dark:text-stone-400">Catatan: ${escapeHtml(meta.reason)}</p>` : ''}
  `;
}

async function loadHomeRecommendations() {
  const container = document.getElementById('home-recommendations');
  if (!container) return;

  container.innerHTML = createLoadingCards(4);

  const authState = currentAuthState || (await getCurrentUser());

  try {
    const result = authState.authenticated
      ? await fetchPersonalRecommendations(8)
      : await fetchColdStartRecommendations(8);

    setText(
      'home-recommendation-title',
      authState.authenticated ? 'For You' : 'Produk Pilihan'
    );

    if (typeof renderProductGrid === 'function') {
      renderProductGrid('home-recommendations', result.recommendations);
    } else {
      container.innerHTML = result.recommendations
        .map((product) => renderRecommendationCard(product, 'hybrid'))
        .join('');
    }
  } catch (error) {
    container.innerHTML = createEmptyState(error.message);
  }
}

function renderFailedSection(containerId, title, description, reason) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(title)}</h2>
      <p class="mt-1 text-sm text-stone-600 dark:text-stone-300">${escapeHtml(description)}</p>
    </div>
    ${createEmptyState(reason || 'Section rekomendasi belum tersedia.')}
  `;
}

function renderRecommendationAccessDenied(authState) {
  const loginState = document.getElementById('recommendation-login-state');
  const adminShell = document.getElementById('recommendation-admin-shell');
  const content = document.getElementById('recommendation-content');
  if (adminShell) adminShell.classList.add('hidden');
  if (content) content.classList.add('hidden');
  if (!loginState) return;

  const authenticated = Boolean(authState && authState.authenticated);
  const helpText = authenticated
    ? 'Akun Anda tidak memiliki role admin untuk membuka halaman analisis teknis.'
    : 'Silakan login sebagai admin untuk membuka halaman analisis teknis.';
  const loginAction = authenticated
    ? ''
    : '<a href="login.html" class="inline-flex h-10 items-center rounded-md border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">Login Admin</a>';

  loginState.innerHTML = `
    <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">Akses ditolak</h2>
    <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">Halaman ini hanya dapat diakses oleh admin.</p>
    <p class="mt-1 text-sm text-stone-600 dark:text-stone-300">${helpText}</p>
    <div class="mt-5 flex flex-wrap justify-center gap-3">
      <a href="index.html" class="inline-flex h-10 items-center rounded-md bg-stone-900 px-5 text-sm font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Kembali ke Beranda</a>
      ${loginAction}
    </div>
  `;
  loginState.classList.remove('hidden');
}

async function loadRecommendationComparisonPage() {
  const authState = await initializeNavbar();

  const role = authState.user ? String(authState.user.role || '').toLowerCase() : '';
  if (!authState.authenticated || role !== 'admin') {
    renderRecommendationAccessDenied(authState);
    return;
  }

  showElement('recommendation-admin-shell');
  showElement('recommendation-content');
  hideElement('recommendation-login-state');

  ['user-based-section', 'content-based-section', 'hybrid-section'].forEach((id) => {
    const container = document.getElementById(id);
    if (container) container.innerHTML = createLoadingCards(4);
  });

  const [userBased, contentBased, hybrid] = await Promise.allSettled([
    fetchUserBasedRecommendations(8),
    fetchContentBasedRecommendations(8),
    fetchHybridRecommendations(8)
  ]);

  if (userBased.status === 'fulfilled') {
    renderRecommendationSection(
      'user-based-section',
      'User-Based Collaborative Filtering',
      'Rekomendasi berdasarkan kemiripan pola interaksi Anda dengan user lain.',
      userBased.value,
      'user-based'
    );
  } else {
    renderFailedSection(
      'user-based-section',
      'User-Based Collaborative Filtering',
      'Rekomendasi berdasarkan kemiripan pola interaksi Anda dengan user lain.',
      userBased.reason.message
    );
  }

  if (contentBased.status === 'fulfilled') {
    renderRecommendationSection(
      'content-based-section',
      'Content-Based Filtering',
      'Rekomendasi berdasarkan kemiripan metadata produk seperti kategori, material, style, warna, dan ruangan.',
      contentBased.value,
      'content-based'
    );
  } else {
    renderFailedSection(
      'content-based-section',
      'Content-Based Filtering',
      'Rekomendasi berdasarkan kemiripan metadata produk seperti kategori, material, style, warna, dan ruangan.',
      contentBased.reason.message
    );
  }

  if (hybrid.status === 'fulfilled') {
    renderRecommendationSection(
      'hybrid-section',
      'Hybrid Recommendation',
      'Rekomendasi gabungan dengan bobot 70% Content-Based Filtering dan 30% User-Based Collaborative Filtering.',
      hybrid.value,
      'hybrid'
    );
  } else {
    renderFailedSection(
      'hybrid-section',
      'Hybrid Recommendation',
      'Rekomendasi gabungan dengan bobot 70% Content-Based Filtering dan 30% User-Based Collaborative Filtering.',
      hybrid.reason.message
    );
  }
}

function renderSummaryCards(summary) {
  const container = document.getElementById('summary-grid');
  if (!container) return;

  const byType = summary.by_type || {};
  const cards = [
    ['Total Interaksi', summary.total_interactions || 0],
    ['Produk Unik', summary.unique_products || 0],
    ['Page View', byType.page_view || 0],
    ['Like', byType.like || 0],
    ['Favorite', byType.favorite || 0],
    ['WhatsApp Inquiry', byType.whatsapp_inquiry || 0]
  ];

  container.innerHTML = cards.map(([label, value]) => {
    return `
      <div class="rounded-lg border border-stone-200 bg-white p-4 text-stone-900 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
        <p class="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">${escapeHtml(label)}</p>
        <p class="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">${value}</p>
      </div>
    `;
  }).join('');
}

function renderTopMetadataList(id, title, items, labelKey) {
  const container = document.getElementById(id);
  if (!container) return;

  const content = items && items.length > 0
    ? items.map((item) => {
        return `<li class="flex justify-between gap-3 border-b border-stone-100 py-2 text-sm text-stone-700 dark:border-stone-800 dark:text-stone-300"><span>${escapeHtml(item[labelKey])}</span><span class="text-stone-500 dark:text-stone-400">${item.total}</span></li>`;
      }).join('')
    : '<li class="py-2 text-sm text-stone-500 dark:text-stone-400">Belum ada data.</li>';

  container.innerHTML = `
    <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(title)}</h3>
    <ul class="mt-2">${content}</ul>
  `;
}

function renderInteractionHistory(history) {
  const container = document.getElementById('history-list');
  if (!container) return;

  const interactions = history && Array.isArray(history.interactions)
    ? history.interactions
    : [];

  if (interactions.length === 0) {
    container.innerHTML = createEmptyState('Belum ada riwayat interaksi.');
    return;
  }

  container.innerHTML = interactions.map((item) => {
    const date = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';
    return `
      <a href="product-detail.html?id=${encodeURIComponent(item.product_id)}" class="flex gap-3 rounded-lg border border-stone-200 bg-white p-3 text-stone-900 shadow-sm hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
        <img src="${escapeHtml(getProductImageUrl(item.product_image_url))}" alt="${escapeHtml(item.product_name)}" class="h-16 w-16 rounded-md object-cover" loading="lazy" onerror="handleImageError(this)" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(item.product_name)}</p>
          <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(item.interaction_type)} | Bobot ${item.weight}</p>
          <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">${date}</p>
        </div>
      </a>
    `;
  }).join('');
}

function renderImplicitRatings(ratings) {
  const container = document.getElementById('ratings-list');
  if (!container) return;

  if (!ratings || ratings.length === 0) {
    container.innerHTML = createEmptyState('Belum ada rating implisit.');
    return;
  }

  container.innerHTML = ratings.slice(0, 8).map((rating) => {
    return `
      <a href="product-detail.html?id=${encodeURIComponent(rating.product_id)}" class="rounded-lg border border-stone-200 bg-white p-4 text-stone-900 shadow-sm hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
        <p class="line-clamp-2 text-sm font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(rating.name)}</p>
        <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(rating.category)}</p>
        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="text-stone-600 dark:text-stone-300">Implicit Rating</span>
          <strong class="text-green-700 dark:text-green-300">${formatScore(rating.implicit_rating)}</strong>
        </div>
        <div class="mt-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Interaksi</span>
          <span>${rating.interaction_count}</span>
        </div>
      </a>
    `;
  }).join('');
}

async function loadProfilePage() {
  const user = await requireUserPage();
  if (!user) return;

  setText('profile-name', user.name);
  setText('profile-username', user.username || '-');
  setText('profile-email', user.email);
  const profileRole = document.getElementById('profile-role');
  if (profileRole) profileRole.innerHTML = renderRoleBadge(user.role);
  setText('profile-auth-provider', user.auth_provider === 'google' ? 'Google' : 'Local');

  const summaryGrid = document.getElementById('summary-grid');
  const historyList = document.getElementById('history-list');
  const ratingsList = document.getElementById('ratings-list');

  if (summaryGrid) summaryGrid.innerHTML = createLoadingCards(3);
  if (historyList) historyList.innerHTML = createLoadingCards(3);
  if (ratingsList) ratingsList.innerHTML = createLoadingCards(3);

  const [summaryResult, historyResult, ratingsResult] = await Promise.allSettled([
    fetchMyInteractionSummary(),
    fetchMyInteractionHistory(),
    fetchMyRatings()
  ]);

  if (summaryResult.status === 'fulfilled') {
    const summary = summaryResult.value;
    renderSummaryCards(summary);
    renderTopMetadataList('top-categories', 'Kategori Teratas', summary.top_categories, 'category');
    renderTopMetadataList('top-materials', 'Material Teratas', summary.top_materials, 'material');
    renderTopMetadataList('top-styles', 'Style Teratas', summary.top_style_themes, 'style_theme');
    renderTopMetadataList('top-colors', 'Warna Teratas', summary.top_colors, 'dominant_color');
  } else if (summaryGrid) {
    summaryGrid.innerHTML = createEmptyState(summaryResult.reason.message);
  }

  if (historyResult.status === 'fulfilled') {
    renderInteractionHistory(historyResult.value);
  } else if (historyList) {
    historyList.innerHTML = createEmptyState(historyResult.reason.message);
  }

  if (ratingsResult.status === 'fulfilled') {
    renderImplicitRatings(ratingsResult.value);
  } else if (ratingsList) {
    ratingsList.innerHTML = createEmptyState(ratingsResult.reason.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'recommendations') {
    loadRecommendationComparisonPage();
  }

  if (document.body.dataset.page === 'profile') {
    loadProfilePage();
  }
});

window.fetchColdStartRecommendations = fetchColdStartRecommendations;
window.fetchPersonalRecommendations = fetchPersonalRecommendations;
window.fetchContentBasedRecommendations = fetchContentBasedRecommendations;
window.fetchUserBasedRecommendations = fetchUserBasedRecommendations;
window.fetchHybridRecommendations = fetchHybridRecommendations;
window.fetchRoomComplementaryRecommendations = fetchRoomComplementaryRecommendations;
window.normalizeRecommendationProduct = normalizeRecommendationProduct;
window.fetchInspirationRecommendations = fetchInspirationRecommendations;
window.mergeInspirationRecommendations = mergeInspirationRecommendations;
window.renderInspirationRecommendations = renderInspirationRecommendations;
window.loadInspirationRecommendationSection = loadInspirationRecommendationSection;
window.fetchProductDetailRecommendations = fetchProductDetailRecommendations;
window.mergeProductDetailRecommendations = mergeInspirationRecommendations;
window.renderProductDetailRecommendations = renderProductDetailRecommendations;
window.renderRoomComplementaryRecommendations = renderRoomComplementaryRecommendations;
window.loadRoomComplementarySection = loadRoomComplementarySection;
window.loadProductDetailRecommendationSection = loadProductDetailRecommendationSection;
window.renderRecommendationCard = renderRecommendationCard;
window.renderRecommendationSection = renderRecommendationSection;
window.loadHomeRecommendations = loadHomeRecommendations;
window.loadRecommendationComparisonPage = loadRecommendationComparisonPage;
window.loadProfilePage = loadProfilePage;

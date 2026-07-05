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

const PROFILE_PAGE_SIZE = 12;
const profileProductState = {
  liked: {
    page: 1,
    limit: PROFILE_PAGE_SIZE
  },
  wishlist: {
    page: 1,
    limit: PROFILE_PAGE_SIZE
  }
};

function formatProfileScore(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(3) : '0.000';
}

function renderSummaryCards(summary) {
  const container = document.getElementById('summary-grid');
  if (!container) return;

  const byType = summary.by_type || {};
  const cards = [
    ['Total Interaksi', summary.total_interactions || 0],
    ['Produk Unik', summary.unique_products || 0],
    ['Dilihat', byType.page_view || 0],
    ['Like', byType.like || 0],
    ['Wishlist', byType.favorite || 0],
    ['Tanya Admin', byType.whatsapp_inquiry || 0]
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

function formatInteractionTypeLabel(interactionType) {
  const labels = {
    page_view: 'Lihat Produk',
    like: 'Like',
    favorite: 'Wishlist',
    whatsapp_inquiry: 'Tanya Admin'
  };

  return labels[interactionType] || interactionType || '-';
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
    const date = item.created_at
      ? new Date(item.created_at).toLocaleString('id-ID')
      : '-';

    return `
      <a href="product-detail.html?id=${encodeURIComponent(item.product_id)}" class="flex gap-3 rounded-lg border border-stone-200 bg-white p-3 text-stone-900 shadow-sm hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
        <img src="${escapeHtml(getProductImageUrl(item.product_image_url))}" alt="${escapeHtml(item.product_name)}" class="h-16 w-16 rounded-md object-cover" loading="lazy" onerror="handleImageError(this)" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(item.product_name)}</p>
          <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(formatInteractionTypeLabel(item.interaction_type))} | Bobot ${item.weight}</p>
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
    container.innerHTML = createEmptyState('Belum ada skor aktivitas.');
    return;
  }

  container.innerHTML = ratings.slice(0, 8).map((rating) => {
    return `
      <a href="product-detail.html?id=${encodeURIComponent(rating.product_id)}" class="rounded-lg border border-stone-200 bg-white p-4 text-stone-900 shadow-sm hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
        <p class="line-clamp-2 text-sm font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(rating.name)}</p>
        <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(rating.category)}</p>
        <div class="mt-3 flex items-center justify-between text-sm">
          <span class="text-stone-600 dark:text-stone-300">Skor Aktivitas</span>
          <strong class="text-green-700 dark:text-green-300">${formatProfileScore(rating.implicit_rating)}</strong>
        </div>
        <div class="mt-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Interaksi</span>
          <span>${rating.interaction_count}</span>
        </div>
      </a>
    `;
  }).join('');
}

function renderProfileProductLoading(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
      ${escapeHtml(message)}
    </div>
    <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      ${createLoadingCards(12)}
    </div>
  `;
}

function renderProfileProductEmpty(message, subtext) {
  return `
    <div class="rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p class="text-sm font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(message)}</p>
      <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">${escapeHtml(subtext)}</p>
    </div>
  `;
}

function setProfileTechnicalSectionsVisible(isVisible) {
  [
    'profileTechnicalSummarySection',
    'profileTechnicalMetadataSection',
    'profileTechnicalHistorySection'
  ].forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.classList.toggle('hidden', !isVisible);
  });
}

function clearProfileTechnicalData() {
  [
    'summary-grid',
    'history-list',
    'ratings-list',
    'top-categories',
    'top-materials',
    'top-styles',
    'top-colors'
  ].forEach((id) => {
    const container = document.getElementById(id);
    if (container) container.innerHTML = '';
  });
}

function renderProfileProductError(containerId, type, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      <p class="text-sm font-semibold">${escapeHtml(message)}</p>
      <p class="mt-2 text-sm">Silakan coba refresh halaman atau login ulang.</p>
      <button type="button" data-profile-retry="${escapeHtml(type)}" class="mt-4 inline-flex h-9 items-center rounded-md bg-red-700 px-3 text-sm font-semibold text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500">
        Coba lagi
      </button>
    </div>
  `;

  const retryButton = container.querySelector('[data-profile-retry]');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      if (type === 'wishlist') {
        loadMyWishlistProducts(profileProductState.wishlist.page);
        return;
      }

      loadMyLikedProducts(profileProductState.liked.page);
    });
  }
}

function renderProfileProductCard(product, type) {
  const isWishlist = type === 'wishlist';
  const timestamp = isWishlist ? product.wishlisted_at : product.liked_at;
  const dateLabel = isWishlist ? 'Disimpan' : 'Disukai';
  const actionLabel = isWishlist ? 'Hapus' : 'Unlike';
  const actionIcon = typeof iconSvg === 'function'
    ? iconSvg(isWishlist ? 'bookmark' : 'heart', true)
    : '';
  const actionClass = isWishlist
    ? 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900'
    : 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900';
  const imageUrl = getProductImageUrl(product.image_url);
  const statusBadge = String(product.status || '').toLowerCase() === 'inactive'
    ? renderStatusBadge(product.status)
    : '';
  const date = timestamp
    ? new Date(timestamp).toLocaleDateString('id-ID')
    : '-';

  return `
    <article class="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-stone-200 bg-white text-stone-900 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
      <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="block overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" class="h-28 w-full object-cover" loading="lazy" onerror="handleImageError(this)" />
      </a>
      <div class="flex flex-1 flex-col p-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-200">${escapeHtml(product.category || '-')}</span>
          ${statusBadge}
        </div>
        <h3 class="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-stone-900 dark:text-stone-100">${escapeHtml(product.name)}</h3>
        <p class="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-100">${formatRupiah(product.price)}</p>
        <p class="mt-1 text-[11px] text-stone-500 dark:text-stone-400">${dateLabel}: ${date}</p>
        <div class="mt-3 grid gap-2">
          <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="inline-flex h-9 items-center justify-center rounded-md border border-stone-300 bg-white px-2 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">
            Lihat
          </a>
          <button type="button" data-profile-product-action="${escapeHtml(type)}" data-product-id="${escapeHtml(product.id)}" class="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${actionClass}">
            ${actionIcon}<span>${actionLabel}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function bindProfileProductActions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('[data-profile-product-action]').forEach((button) => {
    if (button.dataset.ready) return;

    button.addEventListener('click', async () => {
      const productId = button.dataset.productId;
      const type = button.dataset.profileProductAction;

      if (!productId) return;

      const originalHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<span>${type === 'wishlist' ? 'Menghapus...' : 'Unlike...'}</span>`;
      button.classList.add('cursor-not-allowed', 'opacity-60');

      try {
        if (type === 'wishlist') {
          await unwishlistProduct(productId);
          showToast('Produk dihapus dari wishlist.', 'success');
          await loadMyWishlistProducts(profileProductState.wishlist.page, false);
          return;
        }

        await unlikeProduct(productId);
        showToast('Produk dihapus dari daftar like.', 'success');
        await loadMyLikedProducts(profileProductState.liked.page, false);
      } catch (error) {
        showToast(error.message || 'Gagal memperbarui produk.', 'error');
      } finally {
        button.disabled = false;
        button.innerHTML = originalHtml;
        button.classList.remove('cursor-not-allowed', 'opacity-60');
      }
    });

    button.dataset.ready = 'true';
  });
}

function renderProfileProductPagination(containerId, type, pagination) {
  const paginationId = `${containerId}-pagination`;
  const container = document.getElementById(paginationId);
  if (!container) return;

  renderPagination({
    containerId: paginationId,
    pagination,
    onPageChange: (nextPage) => {
      if (type === 'wishlist') {
        loadMyWishlistProducts(nextPage);
        return;
      }

      loadMyLikedProducts(nextPage);
    }
  });
}

function renderProfileProductList(containerId, products, type, pagination = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = Array.isArray(products) ? products : [];
  const paginationId = `${containerId}-pagination`;

  if (items.length === 0) {
    container.innerHTML = type === 'wishlist'
      ? renderProfileProductEmpty(
          'Belum ada produk dalam wishlist Anda.',
          'Simpan produk ke wishlist agar bisa dilihat kembali dari halaman profil.'
        )
      : renderProfileProductEmpty(
          'Belum ada produk yang Anda sukai.',
          'Tekan tombol Like pada halaman detail produk agar produk muncul di sini.'
        );
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      ${items.map((product) => renderProfileProductCard(product, type)).join('')}
    </div>
    <div id="${paginationId}" class="mt-5"></div>
  `;
  bindProfileProductActions(containerId);
  renderProfileProductPagination(containerId, type, pagination);
}

async function loadMyLikedProducts(page = profileProductState.liked.page, showLoading = true) {
  const containerId = 'likedProductsContainer';
  if (typeof page === 'boolean') {
    showLoading = page;
    page = profileProductState.liked.page;
  }

  profileProductState.liked.page = Math.max(1, Number(page) || 1);

  if (showLoading) {
    renderProfileProductLoading(containerId, 'Memuat produk yang disukai...');
  }

  try {
    const result = await getMyLikedProducts(
      profileProductState.liked.page,
      profileProductState.liked.limit
    );
    const products = result.products || [];
    const pagination = result.pagination || {};

    if (
      products.length === 0 &&
      pagination.total_pages > 0 &&
      profileProductState.liked.page > pagination.total_pages
    ) {
      return loadMyLikedProducts(pagination.total_pages, showLoading);
    }

    profileProductState.liked.page = pagination.page || profileProductState.liked.page;
    renderProfileProductList(containerId, products, 'liked', pagination);
    return result;
  } catch (error) {
    renderProfileProductError(containerId, 'liked', 'Gagal memuat produk yang disukai.');
    showToast(error.message || 'Gagal memuat produk yang disukai.', 'error');
    return { products: [], pagination: null };
  }
}

async function loadMyWishlistProducts(page = profileProductState.wishlist.page, showLoading = true) {
  const containerId = 'wishlistProductsContainer';
  if (typeof page === 'boolean') {
    showLoading = page;
    page = profileProductState.wishlist.page;
  }

  profileProductState.wishlist.page = Math.max(1, Number(page) || 1);

  if (showLoading) {
    renderProfileProductLoading(containerId, 'Memuat wishlist...');
  }

  try {
    const result = await getMyWishlistProducts(
      profileProductState.wishlist.page,
      profileProductState.wishlist.limit
    );
    const products = result.products || [];
    const pagination = result.pagination || {};

    if (
      products.length === 0 &&
      pagination.total_pages > 0 &&
      profileProductState.wishlist.page > pagination.total_pages
    ) {
      return loadMyWishlistProducts(pagination.total_pages, showLoading);
    }

    profileProductState.wishlist.page = pagination.page || profileProductState.wishlist.page;
    renderProfileProductList(containerId, products, 'wishlist', pagination);
    return result;
  } catch (error) {
    renderProfileProductError(containerId, 'wishlist', 'Gagal memuat wishlist.');
    showToast(error.message || 'Gagal memuat wishlist.', 'error');
    return { products: [], pagination: null };
  }
}

function renderProfileLoadingStates({ includeTechnical = false } = {}) {
  const summaryGrid = document.getElementById('summary-grid');
  const historyList = document.getElementById('history-list');
  const ratingsList = document.getElementById('ratings-list');

  if (includeTechnical) {
    if (summaryGrid) summaryGrid.innerHTML = createLoadingCards(3);
    if (historyList) historyList.innerHTML = createLoadingCards(3);
    if (ratingsList) ratingsList.innerHTML = createLoadingCards(3);
  } else {
    clearProfileTechnicalData();
  }

  renderProfileProductLoading('likedProductsContainer', 'Memuat produk yang disukai...');
  renderProfileProductLoading('wishlistProductsContainer', 'Memuat wishlist...');
}

function showProfileUnauthorizedState() {
  const content = document.getElementById('profile-content');
  const loginState = document.getElementById('profile-login-state');

  if (content) content.classList.add('hidden');
  if (!loginState) return;

  renderUnauthorizedState(
    'profile-login-state',
    'Silakan login untuk melihat profil, produk yang disukai, dan wishlist Anda.',
    '<a href="login.html" class="inline-flex h-10 items-center rounded-md bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Login</a>'
  );
}

async function loadProfilePage() {
  const authState = await initializeNavbar();
  const content = document.getElementById('profile-content');
  const loginState = document.getElementById('profile-login-state');

  if (!authState.authenticated) {
    showProfileUnauthorizedState();
    return;
  }

  if (content) content.classList.remove('hidden');
  if (loginState) loginState.classList.add('hidden');

  const user = authState.user;
  const isAdmin = String(user.role || '').toLowerCase() === 'admin';
  setText('profile-name', user.name);
  setText('profile-username', user.username || '-');
  setText('profile-email', user.email);
  const profileRole = document.getElementById('profile-role');
  if (profileRole) profileRole.innerHTML = renderRoleBadge(user.role);
  setText('profile-auth-provider', user.auth_provider === 'google' ? 'Google' : 'Local');

  setProfileTechnicalSectionsVisible(isAdmin);
  renderProfileLoadingStates({ includeTechnical: isAdmin });

  const productResults = Promise.allSettled([
    loadMyLikedProducts(false),
    loadMyWishlistProducts(false)
  ]);

  if (!isAdmin) {
    clearProfileTechnicalData();
    await productResults;
    return;
  }

  const [summaryResult, historyResult, ratingsResult] = await Promise.allSettled([
    fetchMyInteractionSummary(),
    fetchMyInteractionHistory(),
    fetchMyRatings()
  ]);

  await productResults;

  if (summaryResult.status === 'fulfilled') {
    const summary = summaryResult.value;
    renderSummaryCards(summary);
    renderTopMetadataList('top-categories', 'Kategori Teratas', summary.top_categories, 'category');
    renderTopMetadataList('top-materials', 'Material Teratas', summary.top_materials, 'material');
    renderTopMetadataList('top-styles', 'Style Teratas', summary.top_style_themes, 'style_theme');
    renderTopMetadataList('top-colors', 'Warna Teratas', summary.top_colors, 'dominant_color');
  } else {
    const summaryGrid = document.getElementById('summary-grid');
    if (summaryGrid) summaryGrid.innerHTML = createEmptyState(summaryResult.reason.message);
    renderTopMetadataList('top-categories', 'Kategori Teratas', [], 'category');
    renderTopMetadataList('top-materials', 'Material Teratas', [], 'material');
    renderTopMetadataList('top-styles', 'Style Teratas', [], 'style_theme');
    renderTopMetadataList('top-colors', 'Warna Teratas', [], 'dominant_color');
  }

  if (historyResult.status === 'fulfilled') {
    renderInteractionHistory(historyResult.value);
  } else {
    const historyList = document.getElementById('history-list');
    if (historyList) historyList.innerHTML = createEmptyState(historyResult.reason.message);
  }

  if (ratingsResult.status === 'fulfilled') {
    renderImplicitRatings(ratingsResult.value);
  } else {
    const ratingsList = document.getElementById('ratings-list');
    if (ratingsList) ratingsList.innerHTML = createEmptyState(ratingsResult.reason.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'profile') {
    loadProfilePage();
  }
});

window.fetchMyInteractionSummary = fetchMyInteractionSummary;
window.fetchMyInteractionHistory = fetchMyInteractionHistory;
window.fetchMyRatings = fetchMyRatings;
window.loadProfilePage = loadProfilePage;
window.loadMyLikedProducts = loadMyLikedProducts;
window.loadMyWishlistProducts = loadMyWishlistProducts;
window.renderProfileProductList = renderProfileProductList;
window.renderProfileProductCard = renderProfileProductCard;

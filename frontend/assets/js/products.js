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

const STOCK_TRACKED_CATEGORIES = [
  'Meja',
  'Kursi',
  'Lemari',
  'Nakas',
  'Meja Rias'
];

const WHATSAPP_ADMIN_NUMBER = '';

async function fetchProducts(params = {}) {
  const response = await apiRequest(`/products${buildQueryString(params)}`);
  return response.data;
}

async function fetchProductDetail(productId) {
  const response = await apiRequest(`/products/${encodeURIComponent(productId)}`);
  return response.data.product;
}

function renderProductImage(product) {
  return `
    <img
      src="${escapeHtml(getProductImageUrl(product.image_url))}"
      alt="${escapeHtml(product.name)}"
      class="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      loading="lazy"
      onerror="handleImageError(this)"
    />
  `;
}

function formatProductMaterial(product) {
  const material = product.material || 'Material belum diisi';
  const variant = product.material_variant || 'Tidak Ada';

  if (variant === 'Tidak Ada') {
    return material;
  }

  return `${material} ${variant}`;
}

function renderProductCard(product) {
  const material = escapeHtml(formatProductMaterial(product));
  const style = product.style_theme ? escapeHtml(product.style_theme) : 'Style belum diisi';

  return `
    <article class="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
      <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="block overflow-hidden bg-stone-100 dark:bg-stone-800">
        ${renderProductImage(product)}
      </a>
      <div class="flex flex-1 flex-col p-4">
        <div class="inline-flex w-fit rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-200">${escapeHtml(product.category)}</div>
        <h3 class="mt-2 line-clamp-2 min-h-[3rem] text-base font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(product.name)}</h3>
        <p class="mt-2 line-clamp-2 text-sm text-stone-600 dark:text-stone-300">${material} | ${style}</p>
        <div class="mt-4 text-base font-semibold text-stone-900 dark:text-stone-100">${formatRupiah(product.price)}</div>
        <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
          Lihat Detail
        </a>
      </div>
    </article>
  `;
}

function formatProductStock(product) {
  if (!STOCK_TRACKED_CATEGORIES.includes(product.category)) {
    return 'Tidak menggunakan stok';
  }

  return Number.isInteger(Number(product.stock)) ? `Stok: ${Number(product.stock)}` : 'Stok belum tersedia';
}

function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = createEmptyState('Belum ada produk untuk ditampilkan.');
    return;
  }

  container.innerHTML = products.map(renderProductCard).join('');
}

function getHomeFilterValues() {
  const input = document.getElementById('home-search');
  const categorySelect = document.getElementById('home-category');

  return {
    search: input ? input.value.trim() : getQueryParam('search') || '',
    category: categorySelect ? categorySelect.value : getQueryParam('category') || ''
  };
}

function updateHomeFilterUrl(filters) {
  if (!window.history || typeof window.history.replaceState !== 'function') return;

  const query = buildQueryString(filters || {});
  window.history.replaceState(null, '', `index.html${query}`);
}

function scrollToProductsSection() {
  const section = document.getElementById('productsSection') || document.getElementById('products');
  if (!section) return;

  if (window.UI && typeof window.UI.smoothScrollTo === 'function') {
    window.UI.smoothScrollTo(section);
    return;
  }

  section.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function scrollToCurrentHomeHash() {
  const hash = String(window.location.hash || '').trim();
  if (!hash || hash === '#') return;

  let target = null;
  try {
    target = document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch (error) {
    target = null;
  }

  if (!target) return;

  window.setTimeout(() => {
    if (window.UI && typeof window.UI.smoothScrollTo === 'function') {
      window.UI.smoothScrollTo(target);
      return;
    }

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 50);
}

async function applyHomeFilters({ scroll = true, toastMessage = '' } = {}) {
  const filters = getHomeFilterValues();
  updateHomeFilterUrl(filters);
  await loadLatestProducts(filters);

  if (scroll) {
    scrollToProductsSection();
  }

  if (toastMessage) {
    showToast(toastMessage, 'info');
  }
}

function renderCategoryGrid() {
  const container = document.getElementById('category-grid');
  if (!container) return;

  container.innerHTML = PRODUCT_CATEGORIES.map((category) => {
    return `
      <button type="button" data-category-card="${escapeHtml(category)}" class="rounded-lg border border-stone-200 bg-white p-4 text-left text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-700">
        <span class="text-sm font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(category)}</span>
        <span class="mt-2 block text-xs text-stone-500 dark:text-stone-400">Lihat koleksi</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('[data-category-card]').forEach((button) => {
    button.addEventListener('click', async () => {
      const category = button.dataset.categoryCard || '';
      const categorySelect = document.getElementById('home-category');
      if (categorySelect) categorySelect.value = category;

      await applyHomeFilters({
        scroll: true,
        toastMessage: `Menampilkan produk kategori ${category}.`
      });
    });
  });
}

function setupHomeSearch() {
  const form = document.getElementById('home-search-form');
  const input = document.getElementById('home-search');
  const categorySelect = document.getElementById('home-category');
  const resetButtons = document.querySelectorAll('#home-reset, [data-home-reset]');

  if (!form || !input) return;

  input.value = getQueryParam('search') || '';
  if (categorySelect) categorySelect.value = getQueryParam('category') || '';

  if (form.dataset.ready) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyHomeFilters({ scroll: true });
  });
  form.dataset.ready = 'true';

  resetButtons.forEach((button) => {
    if (button.dataset.ready) return;

    button.addEventListener('click', () => {
      input.value = '';
      if (categorySelect) categorySelect.value = '';
      applyHomeFilters({ scroll: true });
    });
    button.dataset.ready = 'true';
  });
}

async function loadLatestProducts(filters = null) {
  const container = document.getElementById('latest-products');
  if (!container) return;

  container.innerHTML = createLoadingCards(4);

  try {
    const activeFilters = filters || getHomeFilterValues();
    const category = activeFilters.category || '';
    const search = activeFilters.search || '';
    const data = await fetchProducts({
      category,
      search,
      limit: 8,
      offset: 0
    });

    if (!data.products || data.products.length === 0) {
      container.innerHTML = renderEmptyState(
        'Tidak ada produk yang sesuai dengan pencarian Anda.',
        '<button type="button" data-empty-reset class="inline-flex h-10 items-center rounded-md bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Reset Filter</button>'
      );
      const emptyReset = container.querySelector('[data-empty-reset]');
      if (emptyReset) {
        emptyReset.addEventListener('click', () => {
          const input = document.getElementById('home-search');
          const categorySelect = document.getElementById('home-category');
          if (input) input.value = '';
          if (categorySelect) categorySelect.value = '';
          applyHomeFilters({ scroll: true });
        });
      }
    } else {
      renderProductGrid('latest-products', data.products);
    }

    if (category && search) {
      setText('latest-title', `Produk ${category} untuk "${search}"`);
    } else if (category) {
      setText('latest-title', `Produk ${category}`);
    } else if (search) {
      setText('latest-title', `Hasil pencarian "${search}"`);
    } else {
      setText('latest-title', 'Produk Aktif Terbaru');
    }
  } catch (error) {
    container.innerHTML = createEmptyState(error.message);
  }
}

async function loadHomePage() {
  renderCategoryGrid();
  setupHomeSearch();
  const authState = await initializeNavbar();
  toggleAdminOnlyLinks(authState);

  if (authState.authenticated) {
    hideElement('guest-cta');
  } else {
    showElement('guest-cta');
  }

  await Promise.all([loadHomeRecommendations(), loadLatestProducts()]);
  scrollToCurrentHomeHash();
}

function renderProductDetail(product) {
  setText('product-name', product.name);
  setText('product-price', formatRupiah(product.price));
  setText('product-category', product.category);
  setText('product-material', formatProductMaterial(product));
  setText('product-style', product.style_theme);
  setText('product-color', product.dominant_color);
  setText('product-room', product.room_category);
  setText('product-stock', formatProductStock(product));
  setText('product-description', product.description);

  const image = document.getElementById('product-image');
  const imageFallback = document.getElementById('product-image-fallback');

  if (image) {
    image.src = getProductImageUrl(product.image_url);
    image.alt = product.name;
    image.onerror = () => handleImageError(image);
    image.classList.remove('hidden');
    if (imageFallback) imageFallback.classList.add('hidden');
  } else if (imageFallback) {
    imageFallback.classList.remove('hidden');
  }
}

async function openWhatsappForProduct(productId) {
  const authState = currentAuthState || (await getCurrentUser());
  const button = document.getElementById('whatsapp-button');

  if (!authState.authenticated) {
    showToast('Silakan login untuk menghubungi admin melalui produk ini.', 'warning');
    showProductLoginPrompt();
    return;
  }

  setButtonLoading(button, true, 'Membuka...');

  const data = await logWhatsappInquiry(productId);

  if (data && data.whatsapp_url) {
    showToast('Berhasil mencatat inquiry WhatsApp.', 'success');
    window.open(data.whatsapp_url, '_blank', 'noopener');
    setButtonLoading(button, false);
    if (button) {
      button.className = PRODUCT_ACTION_BUTTON_CLASSES.whatsapp;
      button.innerHTML = `${iconSvg('chat')}<span>Tanya Admin</span>`;
    }
    return;
  }

  if (WHATSAPP_ADMIN_NUMBER) {
    showToast('Berhasil mencatat inquiry WhatsApp.', 'success');
    window.open(`https://wa.me/${WHATSAPP_ADMIN_NUMBER}`, '_blank', 'noopener');
    setButtonLoading(button, false);
    if (button) {
      button.className = PRODUCT_ACTION_BUTTON_CLASSES.whatsapp;
      button.innerHTML = `${iconSvg('chat')}<span>Tanya Admin</span>`;
    }
    return;
  }

  showToast('WhatsApp belum dikonfigurasi di backend.', 'error');
  setButtonLoading(button, false);
  if (button) {
    button.className = PRODUCT_ACTION_BUTTON_CLASSES.whatsapp;
    button.innerHTML = `${iconSvg('chat')}<span>Tanya Admin</span>`;
  }
}

async function loadProductDetailPage() {
  await initializeNavbar();

  const productId = getQueryParam('id');
  const detailContainer = document.getElementById('product-detail');

  if (!productId) {
    hideElement('detail-loading');
    if (detailContainer) {
      detailContainer.innerHTML = createEmptyState('Produk tidak ditemukan.');
      detailContainer.classList.remove('hidden');
    }
    return;
  }

  try {
    const product = await fetchProductDetail(productId);
    renderProductDetail(product);
    showElement('product-detail');
    hideElement('detail-loading');

    if (typeof loadRoomComplementarySection === 'function') {
      loadRoomComplementarySection(product.id);
    }

    if (typeof loadInspirationRecommendationSection === 'function') {
      loadInspirationRecommendationSection(product.id);
    }

    const authState = currentAuthState || (await getCurrentUser());
    if (authState.authenticated) {
      await logPageView(product.id);
    }

    await initializeProductInteractionState(product.id);

    const likeButton = document.getElementById('like-button');
    const wishlistButton = document.getElementById('wishlist-button');
    const whatsappButton = document.getElementById('whatsapp-button');

    if (likeButton) {
      likeButton.addEventListener('click', () => toggleLike(product.id, likeButton));
    }

    if (wishlistButton) {
      wishlistButton.addEventListener('click', () => toggleWishlist(product.id, wishlistButton));
    }

    if (whatsappButton) {
      whatsappButton.className = PRODUCT_ACTION_BUTTON_CLASSES.whatsapp;
      whatsappButton.innerHTML = `${iconSvg('chat')}<span>Tanya Admin</span>`;
      whatsappButton.addEventListener('click', () => openWhatsappForProduct(product.id));
    }
  } catch (error) {
    hideElement('detail-loading');
    if (detailContainer) {
      detailContainer.innerHTML = createEmptyState(error.message);
      detailContainer.classList.remove('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'home') {
    loadHomePage();
  }

  if (document.body.dataset.page === 'product-detail') {
    loadProductDetailPage();
  }
});

window.fetchProducts = fetchProducts;
window.fetchProductDetail = fetchProductDetail;
window.renderProductCard = renderProductCard;
window.renderProductGrid = renderProductGrid;
window.loadHomePage = loadHomePage;
window.loadProductDetailPage = loadProductDetailPage;
window.applyHomeFilters = applyHomeFilters;
window.scrollToProductsSection = scrollToProductsSection;
window.scrollToCurrentHomeHash = scrollToCurrentHomeHash;
window.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
window.formatProductMaterial = formatProductMaterial;
window.WHATSAPP_ADMIN_NUMBER = WHATSAPP_ADMIN_NUMBER;

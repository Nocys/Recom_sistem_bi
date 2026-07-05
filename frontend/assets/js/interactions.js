const INTERACTION_ENDPOINTS = {
  page_view: '/interactions/view',
  whatsapp_inquiry: '/interactions/whatsapp'
};

let currentProductInteractionState = {
  liked: false,
  wishlisted: false
};

const PRODUCT_ACTION_BUTTON_CLASSES = {
  inactive:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800',
  likeActive:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900',
  wishlistActive:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900',
  whatsapp:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-700 dark:hover:bg-green-600'
};

function iconSvg(type, filled = false) {
  if (type === 'heart') {
    return `
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M20.8 4.6c-1.7-1.8-4.5-1.8-6.2 0L12 7.2 9.4 4.6c-1.7-1.8-4.5-1.8-6.2 0-1.8 1.8-1.8 4.7 0 6.5L12 20l8.8-8.9c1.8-1.8 1.8-4.7 0-6.5Z"></path>
      </svg>
    `;
  }

  if (type === 'bookmark') {
    return `
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"></path>
      </svg>
    `;
  }

  return `
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.7-.8L3 21l1.7-5.1A8.5 8.5 0 1 1 21 11.5Z"></path>
    </svg>
  `;
}

async function logInteraction(type, productId, options = {}) {
  const endpoint = INTERACTION_ENDPOINTS[type];

  if (!endpoint || !productId) return null;

  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId
      })
    });

    if (!options.silent) {
      showToast('Interaksi berhasil dicatat.', 'success');
    }

    return response.data;
  } catch (error) {
    if (!options.silent) {
      const message =
        error.message === 'Authentication required'
          ? 'Login diperlukan untuk menyimpan interaksi.'
          : error.message;
      showToast(message, 'error');
    }

    return null;
  }
}

function logPageView(productId) {
  return logInteraction('page_view', productId, {
    silent: true
  });
}

async function logWhatsappInquiry(productId) {
  return logInteraction('whatsapp_inquiry', productId, {
    silent: true
  });
}

async function getProductInteractionState(productId) {
  const response = await apiRequest(
    `/interactions/product-state/${encodeURIComponent(productId)}`
  );
  return response.data;
}

async function likeProduct(productId) {
  const response = await apiRequest('/interactions/like', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId
    })
  });
  return response.data;
}

async function unlikeProduct(productId) {
  const response = await apiRequest(
    `/interactions/like/${encodeURIComponent(productId)}`,
    {
      method: 'DELETE'
    }
  );
  return response.data;
}

async function wishlistProduct(productId) {
  const response = await apiRequest('/interactions/wishlist', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId
    })
  });
  return response.data;
}

async function unwishlistProduct(productId) {
  const response = await apiRequest(
    `/interactions/wishlist/${encodeURIComponent(productId)}`,
    {
      method: 'DELETE'
    }
  );
  return response.data;
}

function updateLikeButton(liked) {
  const button = document.getElementById('like-button');
  if (!button) return;

  button.className = liked
    ? PRODUCT_ACTION_BUTTON_CLASSES.likeActive
    : PRODUCT_ACTION_BUTTON_CLASSES.inactive;
  button.innerHTML = `${iconSvg('heart', liked)}<span>${liked ? 'Liked' : 'Like'}</span>`;
  button.setAttribute('aria-pressed', liked ? 'true' : 'false');
  button.dataset.originalText = button.textContent;
}

function updateWishlistButton(wishlisted) {
  const button = document.getElementById('wishlist-button');
  if (!button) return;

  button.className = wishlisted
    ? PRODUCT_ACTION_BUTTON_CLASSES.wishlistActive
    : PRODUCT_ACTION_BUTTON_CLASSES.inactive;
  button.innerHTML = `${iconSvg('bookmark', wishlisted)}<span>${wishlisted ? 'Wishlisted' : 'Wishlist'}</span>`;
  button.setAttribute('aria-pressed', wishlisted ? 'true' : 'false');
  button.dataset.originalText = button.textContent;
}

function applyProductInteractionState(state) {
  currentProductInteractionState = {
    liked: Boolean(state && state.liked),
    wishlisted: Boolean(state && state.wishlisted)
  };

  updateLikeButton(currentProductInteractionState.liked);
  updateWishlistButton(currentProductInteractionState.wishlisted);
}

function showProductLoginPrompt() {
  const prompt = document.getElementById('interaction-login-prompt');
  if (!prompt) {
    alert('Silakan login untuk menyukai atau menyimpan produk ke wishlist.');
    return;
  }

  prompt.classList.remove('hidden');
  showToast('Silakan login terlebih dahulu.', 'warning');
}

function hideProductLoginPrompt() {
  const prompt = document.getElementById('interaction-login-prompt');
  if (prompt) prompt.classList.add('hidden');
}

async function initializeProductInteractionState(productId) {
  const authState = currentAuthState || (await getCurrentUser());

  if (!authState.authenticated) {
    applyProductInteractionState({
      liked: false,
      wishlisted: false
    });
    return null;
  }

  hideProductLoginPrompt();
  const state = await getProductInteractionState(productId);
  applyProductInteractionState(state);
  return state;
}

async function toggleLike(productId, button) {
  const authState = currentAuthState || (await getCurrentUser());

  if (!authState.authenticated) {
    showProductLoginPrompt();
    return null;
  }

  const wasLiked = currentProductInteractionState.liked;
  setButtonLoading(button, true, wasLiked ? 'Unlike...' : 'Like...');

  try {
    const state = wasLiked
      ? await unlikeProduct(productId)
      : await likeProduct(productId);
    applyProductInteractionState({
      ...currentProductInteractionState,
      ...state
    });
    showToast(wasLiked ? 'Berhasil unlike produk.' : 'Berhasil like produk.', 'success');
    return state;
  } catch (error) {
    showToast(error.message, 'error');
    return null;
  } finally {
    setButtonLoading(button, false);
    updateLikeButton(currentProductInteractionState.liked);
  }
}

async function toggleWishlist(productId, button) {
  const authState = currentAuthState || (await getCurrentUser());

  if (!authState.authenticated) {
    showProductLoginPrompt();
    return null;
  }

  const wasWishlisted = currentProductInteractionState.wishlisted;
  setButtonLoading(button, true, wasWishlisted ? 'Menghapus...' : 'Menyimpan...');

  try {
    const state = wasWishlisted
      ? await unwishlistProduct(productId)
      : await wishlistProduct(productId);
    applyProductInteractionState({
      ...currentProductInteractionState,
      ...state
    });
    showToast(
      wasWishlisted ? 'Berhasil menghapus dari wishlist.' : 'Berhasil menambahkan ke wishlist.',
      'success'
    );
    return state;
  } catch (error) {
    showToast(error.message, 'error');
    return null;
  } finally {
    setButtonLoading(button, false);
    updateWishlistButton(currentProductInteractionState.wishlisted);
  }
}

function logLike(productId) {
  return likeProduct(productId);
}

function logFavorite(productId) {
  return wishlistProduct(productId);
}

window.logInteraction = logInteraction;
window.logPageView = logPageView;
window.logWhatsappInquiry = logWhatsappInquiry;
window.getProductInteractionState = getProductInteractionState;
window.likeProduct = likeProduct;
window.unlikeProduct = unlikeProduct;
window.wishlistProduct = wishlistProduct;
window.unwishlistProduct = unwishlistProduct;
window.toggleLike = toggleLike;
window.toggleWishlist = toggleWishlist;
window.updateLikeButton = updateLikeButton;
window.updateWishlistButton = updateWishlistButton;
window.initializeProductInteractionState = initializeProductInteractionState;
window.logLike = logLike;
window.logFavorite = logFavorite;
window.iconSvg = iconSvg;
window.PRODUCT_ACTION_BUTTON_CLASSES = PRODUCT_ACTION_BUTTON_CLASSES;

const API_BASE_URL = 'http://localhost:5000';

async function apiRequest(endpoint, options = {}) {
  const { headers = {}, ...restOptions } = options;
  const requestOptions = {
    ...restOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && data.message ? data.message : 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

async function getMyLikedProducts(page = 1, limit = 12) {
  const response = await apiRequest(
    `/interactions/my-liked-products${buildQueryString({ page, limit })}`
  );
  return {
    products:
      response.data && Array.isArray(response.data.products)
        ? response.data.products
        : [],
    pagination:
      response.data && response.data.pagination
        ? response.data.pagination
        : {
            page,
            limit,
            total_items: 0,
            total_pages: 0,
            has_previous_page: false,
            has_next_page: false
          }
  };
}

async function getMyWishlistProducts(page = 1, limit = 12) {
  const response = await apiRequest(
    `/interactions/my-wishlist-products${buildQueryString({ page, limit })}`
  );
  return {
    products:
      response.data && Array.isArray(response.data.products)
        ? response.data.products
        : [],
    pagination:
      response.data && response.data.pagination
        ? response.data.pagination
        : {
            page,
            limit,
            total_items: 0,
            total_pages: 0,
            has_previous_page: false,
            has_next_page: false
          }
  };
}

function formatRupiah(value) {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(numericValue);
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showElement(id) {
  const element = document.getElementById(id);
  if (element) element.classList.remove('hidden');
}

function hideElement(id) {
  const element = document.getElementById(id);
  if (element) element.classList.add('hidden');
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function createLoadingCards(count = 4) {
  return Array.from({ length: count })
    .map(() => {
      return `
        <div class="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
          <div class="skeleton aspect-[4/3] rounded-md"></div>
          <div class="mt-4 h-4 w-3/4 rounded skeleton"></div>
          <div class="mt-3 h-4 w-1/2 rounded skeleton"></div>
          <div class="mt-5 h-9 rounded-md skeleton"></div>
        </div>
      `;
    })
    .join('');
}

function createEmptyState(message) {
  if (typeof window.renderEmptyState === 'function') {
    return window.renderEmptyState(message);
  }

  return `
    <div class="rounded-lg border border-stone-200 bg-white p-6 text-center text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
      ${escapeHtml(message)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fallbackShowToast(message, type = 'info') {
  let toast = document.getElementById('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className =
      'fixed bottom-5 right-5 z-50 max-w-sm rounded-md px-4 py-3 text-sm shadow-lg';
    document.body.appendChild(toast);
  }

  const colorClass =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
      : type === 'success'
        ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
        : type === 'warning'
          ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'
          : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200';

  toast.className = `fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${colorClass}`;
  toast.textContent = message;
  toast.classList.remove('hidden');

  window.clearTimeout(fallbackShowToast.timeoutId);
  fallbackShowToast.timeoutId = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

window.API_BASE_URL = API_BASE_URL;
window.apiRequest = apiRequest;
window.getMyLikedProducts = getMyLikedProducts;
window.getMyWishlistProducts = getMyWishlistProducts;
window.formatRupiah = formatRupiah;
window.getQueryParam = getQueryParam;
window.showElement = showElement;
window.hideElement = hideElement;
window.setText = setText;
window.createLoadingCards = createLoadingCards;
window.createEmptyState = createEmptyState;
window.escapeHtml = escapeHtml;
if (!window.showToast) {
  window.showToast = fallbackShowToast;
}
window.buildQueryString = buildQueryString;

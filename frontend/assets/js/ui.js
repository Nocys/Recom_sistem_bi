const UI_CLASSES = {
  page: 'bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100',
  card:
    'rounded-lg border border-stone-200 bg-white text-stone-900 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100',
  mutedText: 'text-stone-600 dark:text-stone-300',
  subtleText: 'text-stone-500 dark:text-stone-400',
  input:
    'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500',
  select:
    'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100',
  primaryButton:
    'inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white',
  secondaryButton:
    'inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800',
  dangerButton:
    'inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600',
  warningButton:
    'inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 font-medium text-stone-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-500',
  themeToggle:
    'rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800'
};

const PRODUCT_IMAGE_FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#e7e5e4"/><rect x="120" y="150" width="560" height="300" rx="24" fill="#fafaf9" stroke="#a8a29e" stroke-width="6"/><path d="M210 375l110-115 80 85 58-54 132 84" fill="none" stroke="#78716c" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><circle cx="520" cy="245" r="42" fill="#d6d3d1"/><text x="400" y="505" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#57534e">Gambar tidak tersedia</text></svg>';
const PRODUCT_IMAGE_FALLBACK_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PRODUCT_IMAGE_FALLBACK_SVG)}`;

function getProductImageUrl(imageUrl) {
  const value = String(imageUrl || '').trim();
  return value.length > 0 ? value : PRODUCT_IMAGE_FALLBACK_URL;
}

function handleImageError(image) {
  if (!image || image.dataset.fallbackApplied === 'true') return;

  image.dataset.fallbackApplied = 'true';
  image.src = PRODUCT_IMAGE_FALLBACK_URL;
}

function getStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem('theme');
    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
  } catch (error) {
    return 'light';
  }
}

function getCurrentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function renderThemeToggle() {
  const theme = getCurrentTheme();
  const toggles = document.querySelectorAll('[data-theme-toggle]');

  toggles.forEach((toggle) => {
    toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Aktifkan light mode' : 'Aktifkan dark mode'
    );
    toggle.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
  });
}

function applyTheme(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', normalizedTheme === 'dark');

  try {
    window.localStorage.setItem('theme', normalizedTheme);
  } catch (error) {
    // localStorage can be unavailable in restricted browser contexts.
  }

  renderThemeToggle();
  return normalizedTheme;
}

function toggleTheme() {
  const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast(nextTheme === 'dark' ? 'Dark mode aktif' : 'Light mode aktif', 'info');
}

function initTheme() {
  applyTheme(getStoredTheme());
}

function getToastColor(type) {
  const colors = {
    success:
      'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
    error:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
    warning:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
    info:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
  };

  return colors[type] || colors.info;
}

function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `rounded-xl border px-4 py-3 text-sm shadow-lg transition ${getToastColor(type)}`;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('opacity-0');
    window.setTimeout(() => toast.remove(), 180);
  }, duration);
}

function showConfirm(message) {
  return window.confirm(message);
}

function smoothScrollTo(target, options = {}) {
  const element = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!element) return null;

  element.scrollIntoView({
    behavior: options.behavior || 'smooth',
    block: options.block || 'start'
  });

  return element;
}

function smoothScrollToTop(options = {}) {
  window.scrollTo({
    top: 0,
    behavior: options.behavior || 'smooth'
  });
}

function getHashTarget(hash) {
  const rawHash = String(hash || '').trim();
  if (!rawHash || rawHash === '#') return null;

  try {
    return document.getElementById(decodeURIComponent(rawHash.slice(1)));
  } catch (error) {
    return null;
  }
}

function handleSmoothScrollClick(event) {
  const trigger = event.target.closest('[data-scroll-target], [data-scroll-top]');
  if (!trigger) return;

  if (trigger.hasAttribute('data-scroll-top')) {
    event.preventDefault();
    smoothScrollToTop();
    if (window.history && typeof window.history.pushState === 'function') {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
    }
    return;
  }

  const targetSelector = trigger.getAttribute('data-scroll-target');
  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  event.preventDefault();
  smoothScrollTo(target);

  if (
    trigger.getAttribute('href') &&
    trigger.getAttribute('href').startsWith('#') &&
    target.id &&
    window.history &&
    typeof window.history.pushState === 'function'
  ) {
    window.history.pushState(null, '', `#${target.id}`);
  }
}

function handleInitialHashScroll() {
  const target = getHashTarget(window.location.hash);
  if (!target) return;

  window.setTimeout(() => {
    smoothScrollTo(target);
  }, 100);
}

function setButtonLoading(button, isLoading, loadingText = 'Memproses...') {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }

    button.disabled = true;
    button.textContent = loadingText;
    button.classList.add('cursor-not-allowed', 'opacity-60');
    return;
  }

  button.disabled = false;
  button.textContent = button.dataset.originalText || button.textContent;
  delete button.dataset.originalText;
  button.classList.remove('cursor-not-allowed', 'opacity-60');
}

function renderRoleBadge(role) {
  const normalizedRole = String(role || 'user').toLowerCase();
  if (normalizedRole === 'guest') {
    return '<span class="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">Guest</span>';
  }

  const isAdmin = normalizedRole === 'admin';
  const label = isAdmin ? 'Admin' : 'User';
  const color = isAdmin
    ? 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-200'
    : 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200';

  return `<span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${color}">${label}</span>`;
}

function renderStatusBadge(status) {
  const normalizedStatus = String(status || '').toLowerCase();
  const isActive = normalizedStatus === 'active';
  const label = isActive ? 'Active' : 'Inactive';
  const color = isActive
    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
    : 'border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300';

  return `<span class="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${color}">${label}</span>`;
}

function renderEmptyState(message, actionHtml = '') {
  return `
    <div class="rounded-lg border border-stone-200 bg-white p-6 text-center text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
      <p class="text-sm text-stone-600 dark:text-stone-300">${escapeHtml(message || 'Tidak ada data yang tersedia.')}</p>
      ${actionHtml ? `<div class="mt-4">${actionHtml}</div>` : ''}
    </div>
  `;
}

function renderUnauthorizedState(containerId, message, actionHtml) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <h2 class="text-lg font-semibold">Akses terbatas</h2>
      <p class="mt-2 text-sm">${escapeHtml(message || 'Silakan login sebagai admin untuk mengakses halaman ini.')}</p>
      <div class="mt-4">
        ${actionHtml || '<a href="login.html" class="inline-flex h-10 items-center rounded-md bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Login</a>'}
      </div>
    </div>
  `;
  container.classList.remove('hidden');
}

function getPaginationPages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const result = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      result.push('ellipsis');
    }

    result.push(page);
  });

  return result;
}

function renderPagination({
  containerId,
  pagination = {},
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange
} = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const parsedPage = Number(page || pagination.page || 1);
  const parsedPageCount = Number(totalPages || pagination.total_pages || 0);
  const parsedItemCount = Number(totalItems || pagination.total_items || 0);
  const parsedLimit = Number(limit || pagination.limit || 12);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const pageCount =
    Number.isFinite(parsedPageCount) && parsedPageCount > 0
      ? Math.floor(parsedPageCount)
      : 0;
  const itemCount =
    Number.isFinite(parsedItemCount) && parsedItemCount > 0 ? parsedItemCount : 0;
  const pageLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 12;

  if (itemCount === 0) {
    container.innerHTML = '';
    return;
  }

  const firstItem = (currentPage - 1) * pageLimit + 1;
  const lastItem = Math.min(itemCount, currentPage * pageLimit);

  if (pageCount <= 1) {
    container.innerHTML = `
      <p class="text-xs text-stone-500 dark:text-stone-400">
        Menampilkan ${firstItem}-${lastItem} dari ${itemCount} produk.
      </p>
    `;
    return;
  }

  const baseButtonClass =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  const pageButtonClass =
    'border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800';
  const activeButtonClass =
    'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900';

  const pageButtons = getPaginationPages(currentPage, pageCount)
    .map((item) => {
      if (item === 'ellipsis') {
        return '<span class="inline-flex h-9 min-w-9 items-center justify-center text-xs text-stone-400">...</span>';
      }

      const isActive = item === currentPage;
      return `
        <button type="button" data-pagination-page="${item}" class="${baseButtonClass} ${isActive ? activeButtonClass : pageButtonClass}" ${isActive ? 'aria-current="page"' : ''}>
          ${item}
        </button>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-stone-500 dark:text-stone-400">
        Menampilkan ${firstItem}-${lastItem} dari ${itemCount} produk.
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" data-pagination-page="${currentPage - 1}" class="${baseButtonClass} ${pageButtonClass}" ${currentPage <= 1 ? 'disabled' : ''}>
          Prev
        </button>
        ${pageButtons}
        <button type="button" data-pagination-page="${currentPage + 1}" class="${baseButtonClass} ${pageButtonClass}" ${currentPage >= pageCount ? 'disabled' : ''}>
          Next
        </button>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-pagination-page]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled || typeof onPageChange !== 'function') return;

      const nextPage = Number(button.dataset.paginationPage);
      if (Number.isFinite(nextPage) && nextPage >= 1 && nextPage <= pageCount) {
        onPageChange(nextPage);
      }
    });
  });
}

function storeToast(message, type = 'info') {
  window.sessionStorage.setItem(
    'pending_toast',
    JSON.stringify({
      message,
      type
    })
  );
}

function flushStoredToast() {
  const rawToast = window.sessionStorage.getItem('pending_toast');
  if (!rawToast) return;

  window.sessionStorage.removeItem('pending_toast');

  try {
    const toast = JSON.parse(rawToast);
    showToast(toast.message, toast.type);
  } catch (error) {
    showToast(rawToast, 'info');
  }
}

initTheme();
document.addEventListener('click', handleSmoothScrollClick);
document.addEventListener('DOMContentLoaded', () => {
  renderThemeToggle();
  flushStoredToast();
  handleInitialHashScroll();
});

window.UI = {
  ...window.UI,
  smoothScrollTo
};
window.getStoredTheme = getStoredTheme;
window.UI_CLASSES = UI_CLASSES;
window.PRODUCT_IMAGE_FALLBACK_URL = PRODUCT_IMAGE_FALLBACK_URL;
window.getProductImageUrl = getProductImageUrl;
window.handleImageError = handleImageError;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;
window.renderThemeToggle = renderThemeToggle;
window.showToast = showToast;
window.showConfirm = showConfirm;
window.smoothScrollTo = smoothScrollTo;
window.setButtonLoading = setButtonLoading;
window.renderRoleBadge = renderRoleBadge;
window.renderStatusBadge = renderStatusBadge;
window.renderEmptyState = renderEmptyState;
window.renderUnauthorizedState = renderUnauthorizedState;
window.renderPagination = renderPagination;
window.storeToast = storeToast;

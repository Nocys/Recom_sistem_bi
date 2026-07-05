let currentAuthState = null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAV_LINK_CLASS = 'font-medium text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white';
const NAV_LINK_ACTIVE_CLASS = 'font-semibold text-stone-950 dark:text-stone-100';

function getCurrentPage() {
  return document.body ? document.body.dataset.page : '';
}

function renderNavLink({ href, label, activePages = [], scrollTarget = '', scrollTop = false }) {
  const currentPage = getCurrentPage();
  const isActive = activePages.includes(currentPage);
  const scrollAttributes = [
    scrollTarget ? `data-scroll-target="${scrollTarget}"` : '',
    scrollTop ? 'data-scroll-top="true"' : ''
  ].filter(Boolean).join(' ');

  return `<a href="${href}" ${scrollAttributes} class="${isActive ? NAV_LINK_ACTIVE_CLASS : NAV_LINK_CLASS}">${label}</a>`;
}

function renderPrimaryNavbar(authState = currentAuthState) {
  const container = document.getElementById('primary-nav');
  if (!container) return;

  const currentPage = getCurrentPage();
  const isHomePage = currentPage === 'home';
  const homeLink = isHomePage
    ? { href: '#heroSection', label: 'Home', activePages: ['home'], scrollTop: true }
    : { href: 'index.html', label: 'Home', activePages: ['home'] };
  const productLink = isHomePage
    ? {
        href: '#productsSection',
        label: 'Produk',
        activePages: ['product-detail'],
        scrollTarget: '#productsSection'
      }
    : { href: 'index.html#productsSection', label: 'Produk', activePages: ['product-detail'] };
  const authenticated = Boolean(authState && authState.authenticated);
  const role = authenticated && authState.user
    ? String(authState.user.role || 'user').toLowerCase()
    : 'guest';
  const isAdmin = role === 'admin';
  const links = isAdmin
    ? [
        homeLink,
        productLink,
        { href: 'admin-dashboard.html', label: 'Admin Dashboard', activePages: ['admin-dashboard'] },
        { href: 'admin-products.html', label: 'Kelola Produk', activePages: ['admin-products'] },
        { href: 'recommendations.html', label: 'Analisis Rekomendasi', activePages: ['recommendations'] },
        { href: 'profile.html', label: 'Profile', activePages: ['profile'] }
      ]
    : [
        homeLink,
        productLink,
        ...(authenticated
          ? [{ href: 'profile.html', label: 'Profile', activePages: ['profile'] }]
          : [])
      ];

  container.innerHTML = links.map(renderNavLink).join('');
}

function toggleAdminOnlyLinks(authState = currentAuthState) {
  const role = authState && authState.user ? String(authState.user.role || '').toLowerCase() : '';
  const isAdmin = Boolean(authState && authState.authenticated && role === 'admin');

  document.querySelectorAll('[data-admin-only-link]').forEach((element) => {
    element.hidden = !isAdmin;
    element.classList.toggle('hidden', !isAdmin);
  });
}

async function getCurrentUser() {
  try {
    const response = await apiRequest('/auth/me');
    currentAuthState = response.data || {
      authenticated: false,
      user: null
    };
  } catch (error) {
    currentAuthState = {
      authenticated: false,
      user: null
    };
  }

  return currentAuthState;
}

function loginWithGoogle(button) {
  if (button) setButtonLoading(button, true, 'Mengarahkan...');
  window.location.href = `${API_BASE_URL}/auth/google`;
}

function validateLoginPayload(identifier, password) {
  if (!String(identifier || '').trim()) {
    return 'Username atau email wajib diisi.';
  }

  if (!String(password || '').trim()) {
    return 'Password wajib diisi.';
  }

  return null;
}

function validateRegisterPayload(payload) {
  const username = String(payload.username || '').trim();
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const password = String(payload.password || '');

  if (username.length < 3) {
    return 'Username minimal 3 karakter.';
  }

  if (!name) {
    return 'Nama wajib diisi.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Format email tidak valid.';
  }

  if (password.length < 8) {
    return 'Password minimal 8 karakter.';
  }

  return null;
}

async function loginLocal(identifier, password, button) {
  const validationMessage = validateLoginPayload(identifier, password);

  if (validationMessage) {
    showToast(validationMessage, 'warning');
    return null;
  }

  setButtonLoading(button, true, 'Login...');

  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        password
      })
    });

    currentAuthState = response.data;
    storeToast('Login berhasil.', 'success');
    window.location.href = 'index.html';
    return response.data;
  } finally {
    setButtonLoading(button, false);
  }
}

async function registerLocal(payload, button) {
  const validationMessage = validateRegisterPayload(payload);

  if (validationMessage) {
    showToast(validationMessage, 'warning');
    return null;
  }

  setButtonLoading(button, true, 'Register...');

  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    currentAuthState = response.data;
    storeToast('Register berhasil.', 'success');
    window.location.href = 'index.html';
    return response.data;
  } finally {
    setButtonLoading(button, false);
  }
}

async function logout(button) {
  if (!showConfirm('Apakah Anda yakin ingin logout?')) {
    return;
  }

  setButtonLoading(button, true, 'Logout...');

  try {
    await apiRequest('/auth/logout', {
      method: 'POST'
    });
    storeToast('Logout berhasil.', 'success');
    window.location.href = 'index.html';
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(button, false);
  }
}

function renderNavbarAuth(authState = currentAuthState) {
  renderPrimaryNavbar(authState);
  toggleAdminOnlyLinks(authState);

  const container = document.getElementById('nav-auth');
  if (!container) return;

  if (!authState || !authState.authenticated) {
    container.innerHTML = `
      <a href="login.html" class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
        Login
      </a>
    `;
    return;
  }

  const user = authState.user;

  container.innerHTML = `
    ${renderRoleBadge(user.role)}
    <button onclick="logout(this)" class="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">
      Logout
    </button>
  `;
}

async function initializeNavbar() {
  const authState = await getCurrentUser();
  renderNavbarAuth(authState);
  return authState;
}

async function requireUserPage() {
  const authState = await initializeNavbar();

  if (!authState.authenticated) {
    window.location.href = 'login.html';
    return null;
  }

  return authState.user;
}

async function requireAdminPage() {
  const authState = await initializeNavbar();
  const adminContent = document.getElementById('admin-content');

  if (!authState.authenticated) {
    if (adminContent) adminContent.classList.add('hidden');
    renderUnauthorizedState(
      'access-denied',
      'Silakan login sebagai admin untuk mengakses halaman ini.',
      '<a href="login.html" class="inline-flex h-10 items-center rounded-md bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Login</a>'
    );
    return null;
  }

  if (String(authState.user.role || '').toLowerCase() !== 'admin') {
    if (adminContent) adminContent.classList.add('hidden');
    renderUnauthorizedState(
      'access-denied',
      'Akses ditolak. Halaman ini hanya untuk admin.',
      '<a href="index.html" class="inline-flex h-10 items-center rounded-md bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Kembali ke Home</a>'
    );
    return null;
  }

  hideElement('access-denied');
  if (adminContent) adminContent.classList.remove('hidden');
  return authState.user;
}

function setActiveAuthTab(tabName) {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('local-login-form');
  const registerForm = document.getElementById('local-register-form');

  if (!loginTab || !registerTab || !loginForm || !registerForm) return;

  const loginActive = tabName === 'login';
  loginForm.classList.toggle('hidden', !loginActive);
  registerForm.classList.toggle('hidden', loginActive);

  const tabBaseClass = 'h-10 rounded-md border px-3 text-sm font-semibold transition';
  const activeClass =
    'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900';
  const inactiveClass =
    'border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800';

  loginTab.className = `${tabBaseClass} ${loginActive ? activeClass : inactiveClass}`;
  registerTab.className = `${tabBaseClass} ${loginActive ? inactiveClass : activeClass}`;
}

function setupPasswordToggles() {
  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    if (button.dataset.ready) return;

    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;

      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      button.textContent = showing ? 'Tampilkan' : 'Sembunyikan';
    });
    button.dataset.ready = 'true';
  });
}

function bindLocalAuthForms() {
  const loginForm = document.getElementById('local-login-form');
  const registerForm = document.getElementById('local-register-form');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');

  if (loginTab && !loginTab.dataset.ready) {
    loginTab.addEventListener('click', () => setActiveAuthTab('login'));
    loginTab.dataset.ready = 'true';
  }

  if (registerTab && !registerTab.dataset.ready) {
    registerTab.addEventListener('click', () => setActiveAuthTab('register'));
    registerTab.dataset.ready = 'true';
  }

  if (loginForm && !loginForm.dataset.ready) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);

      try {
        await loginLocal(
          formData.get('identifier'),
          formData.get('password'),
          loginForm.querySelector('button[type="submit"]')
        );
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
    loginForm.dataset.ready = 'true';
  }

  if (registerForm && !registerForm.dataset.ready) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);

      try {
        await registerLocal(
          {
            username: formData.get('username'),
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password')
          },
          registerForm.querySelector('button[type="submit"]')
        );
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
    registerForm.dataset.ready = 'true';
  }

  setupPasswordToggles();
  setActiveAuthTab('login');
}

async function loadLoginPage() {
  const authState = await initializeNavbar();
  const loginPanel = document.getElementById('login-panel');
  const loggedInPanel = document.getElementById('logged-in-panel');

  if (!loginPanel || !loggedInPanel) return;

  if (authState.authenticated) {
    loginPanel.classList.add('hidden');
    loggedInPanel.classList.remove('hidden');
    setText('logged-in-name', authState.user.name);
    setText('logged-in-email', authState.user.email);
    setText('logged-in-role', authState.user.role);
    const badge = document.getElementById('logged-in-role-badge');
    if (badge) badge.innerHTML = renderRoleBadge(authState.user.role);
    return;
  }

  loginPanel.classList.remove('hidden');
  loggedInPanel.classList.add('hidden');
  bindLocalAuthForms();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'login') {
    loadLoginPage();
    return;
  }

  initializeNavbar();
});

window.getCurrentUser = getCurrentUser;
window.renderNavbarAuth = renderNavbarAuth;
window.renderPrimaryNavbar = renderPrimaryNavbar;
window.toggleAdminOnlyLinks = toggleAdminOnlyLinks;
window.loginWithGoogle = loginWithGoogle;
window.loginLocal = loginLocal;
window.registerLocal = registerLocal;
window.logout = logout;
window.requireAdminPage = requireAdminPage;
window.requireUserPage = requireUserPage;
window.initializeNavbar = initializeNavbar;

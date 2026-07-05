async function fetchAdminProducts(params = {}) {
  const response = await apiRequest(`/admin/products${buildQueryString(params)}`);
  return response.data;
}

let editingProductId = '';

const ADMIN_PRODUCT_CATEGORIES = [
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

const ADMIN_ROOM_CATEGORIES = [
  'Ruang Tamu',
  'Ruang Makan',
  'Dapur',
  'Kamar Tidur',
  'Mini Bar'
];

const ADMIN_STYLE_THEMES = [
  'Modern',
  'Minimalis',
  'Japandi'
];

const ADMIN_PRODUCT_MATERIALS = [
  'HPL',
  'Kayu',
  'Logam',
  'Kaca',
  'Linen',
  'Kayu + Logam',
  'Logam + Linen',
  'Kayu + Linen',
  'HPL + Kaca'
];

const ADMIN_MATERIAL_VARIANTS = [
  'Tidak Ada',
  'Woodgrain',
  'Solid',
  'Marble',
  'Glossy'
];

const ADMIN_STOCK_TRACKED_CATEGORIES = [
  'Meja',
  'Kursi',
  'Lemari',
  'Nakas',
  'Meja Rias'
];

const ADMIN_NON_STOCK_CATEGORIES = [
  'Kitchen Set',
  'Living Set',
  'Bedset',
  'Minibar'
];

async function fetchAdminProductDetail(productId) {
  const response = await apiRequest(`/admin/products/${encodeURIComponent(productId)}`);
  return response.data.product;
}

function isStockTrackedCategory(category) {
  return ADMIN_STOCK_TRACKED_CATEGORIES.includes(category);
}

function isNonStockCategory(category) {
  return ADMIN_NON_STOCK_CATEGORIES.includes(category);
}

function isValidImageUrl(imageUrl) {
  return (
    typeof imageUrl === 'string' &&
    (imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('data:image/'))
  );
}

function formatAdminStock(product) {
  if (!isStockTrackedCategory(product.category)) {
    return 'Tidak menggunakan stok';
  }

  return Number.isInteger(Number(product.stock)) ? `Stok: ${Number(product.stock)}` : 'Stok belum diisi';
}

function formatProductMaterial(product) {
  const material = product.material || '-';
  const variant = product.material_variant || 'Tidak Ada';

  if (variant === 'Tidak Ada') {
    return material;
  }

  return `${material} ${variant}`;
}

function trashIcon() {
  return `
    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 6h18"></path>
      <path d="M8 6V4h8v2"></path>
      <path d="M6 6l1 15h10l1-15"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
    </svg>
  `;
}

function getProductFormPayload() {
  const form = document.getElementById('product-form');
  const data = new FormData(form);
  const category = String(data.get('category') || '').trim();
  const rawPrice = String(data.get('price') || '').trim();
  const rawStock = String(data.get('stock') || '').trim();

  return {
    name: String(data.get('name') || '').trim(),
    image_url: String(data.get('image_url') || '').trim(),
    category,
    material: String(data.get('material') || '').trim(),
    material_variant: String(data.get('material_variant') || 'Tidak Ada').trim() || 'Tidak Ada',
    style_theme: String(data.get('style_theme') || '').trim(),
    dominant_color: String(data.get('dominant_color') || '').trim(),
    room_category: String(data.get('room_category') || '').trim(),
    description: String(data.get('description') || '').trim(),
    price: rawPrice === '' ? null : Number(rawPrice),
    stock: isStockTrackedCategory(category) && rawStock !== '' ? Number(rawStock) : null,
    status: String(data.get('status') || 'active').trim()
  };
}

function validateAdminProductPayload(payload) {
  const requiredFields = [
    'name',
    'image_url',
    'category',
    'material',
    'material_variant',
    'style_theme',
    'dominant_color',
    'room_category',
    'description',
    'status'
  ];

  const missing = requiredFields.filter((field) => !payload[field]);

  if (missing.length > 0) {
    return `Field wajib belum lengkap: ${missing.join(', ')}`;
  }

  if (!isValidImageUrl(payload.image_url)) {
    return 'URL gambar tidak valid. Gunakan http://, https://, atau data:image/.';
  }

  if (!ADMIN_PRODUCT_CATEGORIES.includes(payload.category)) {
    return `Category harus salah satu dari: ${ADMIN_PRODUCT_CATEGORIES.join(', ')}.`;
  }

  if (!ADMIN_PRODUCT_MATERIALS.includes(payload.material)) {
    return `Material harus salah satu dari: ${ADMIN_PRODUCT_MATERIALS.join(', ')}.`;
  }

  if (!ADMIN_MATERIAL_VARIANTS.includes(payload.material_variant)) {
    return `Material variant harus salah satu dari: ${ADMIN_MATERIAL_VARIANTS.join(', ')}.`;
  }

  if (!ADMIN_STYLE_THEMES.includes(payload.style_theme)) {
    return `Style theme harus salah satu dari: ${ADMIN_STYLE_THEMES.join(', ')}.`;
  }

  if (!ADMIN_ROOM_CATEGORIES.includes(payload.room_category)) {
    return `Room category harus salah satu dari: ${ADMIN_ROOM_CATEGORIES.join(', ')}.`;
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return 'Harga harus berupa angka lebih besar atau sama dengan 0.';
  }

  if (isStockTrackedCategory(payload.category)) {
    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      return 'Stock harus berupa bilangan bulat lebih besar atau sama dengan 0.';
    }
  } else if (isNonStockCategory(payload.category)) {
    payload.stock = null;
  }

  if (!['active', 'inactive'].includes(payload.status)) {
    return 'Status wajib active atau inactive.';
  }

  return null;
}

async function loadAdminDashboard() {
  const user = await requireAdminPage();
  if (!user) return;

  setText('admin-name', user.name);
  setText('admin-email', user.email);
  setText('admin-auth-provider', user.auth_provider === 'google' ? 'Google' : 'Local');
  const adminRole = document.getElementById('admin-role');
  if (adminRole) adminRole.innerHTML = renderRoleBadge(user.role);

  try {
    const data = await fetchAdminProducts({ limit: 100, offset: 0 });
    const products = data.products || [];
    const activeCount = products.filter((product) => product.status === 'active').length;
    const inactiveCount = products.filter((product) => product.status === 'inactive').length;

    setText('admin-total-products', String(data.pagination ? data.pagination.total : products.length));
    setText('admin-active-products', String(activeCount));
    setText('admin-inactive-products', String(inactiveCount));
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadAdminProducts() {
  const user = await requireAdminPage();
  if (!user) return;

  setupAdminProductEvents();

  const tableContainer = document.getElementById('admin-products-table');
  if (tableContainer) tableContainer.innerHTML = createLoadingCards(3);

  try {
    const data = await fetchAdminProducts({
      category: document.getElementById('filter-category')?.value || '',
      status: document.getElementById('filter-status')?.value || '',
      search: document.getElementById('filter-search')?.value || '',
      limit: 100,
      offset: 0
    });

    renderAdminProductTable(data.products || []);
    setText('admin-products-total', `${data.pagination ? data.pagination.total : data.products.length} produk`);
  } catch (error) {
    if (tableContainer) tableContainer.innerHTML = createEmptyState(error.message);
  }
}

function renderAdminProductTable(products) {
  const container = document.getElementById('admin-products-table');
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = createEmptyState('Belum ada produk yang sesuai filter.');
    return;
  }

  container.innerHTML = `
    <div class="max-h-[620px] overflow-auto rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <table class="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
        <thead class="bg-stone-100 text-left text-xs font-semibold uppercase text-stone-700 dark:bg-stone-800 dark:text-stone-200">
          <tr>
            <th class="px-4 py-3">Produk</th>
            <th class="px-4 py-3">Kategori</th>
            <th class="px-4 py-3">Harga</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-200 dark:divide-stone-800">
          ${products.map((product) => {
            return `
              <tr class="align-top border-stone-200 bg-white text-stone-800 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">
                <td class="px-4 py-3">
                  <div class="flex min-w-[260px] gap-3">
                    <img src="${escapeHtml(getProductImageUrl(product.image_url))}" alt="${escapeHtml(product.name)}" class="h-14 w-14 rounded-md object-cover" loading="lazy" onerror="handleImageError(this)" />
                    <div>
                      <p class="font-semibold text-stone-900 dark:text-stone-100">${escapeHtml(product.name)}</p>
                      <p class="mt-1 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(formatProductMaterial(product))} | ${escapeHtml(product.style_theme)}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-stone-700 dark:text-stone-300">${escapeHtml(product.category)}</td>
                <td class="px-4 py-3 text-stone-700 dark:text-stone-300">${formatRupiah(product.price)}</td>
                <td class="px-4 py-3 text-stone-700 dark:text-stone-300">${escapeHtml(formatAdminStock(product))}</td>
                <td class="px-4 py-3">
                  ${renderStatusBadge(product.status)}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex flex-wrap justify-end gap-2">
                    <button type="button" onclick="fillProductFormById('${product.id}')" class="rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800">Edit</button>
                    <button type="button" onclick="deactivateProduct('${product.id}', this)" class="rounded-md bg-amber-500 px-3 py-2 text-xs font-medium text-stone-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-500">Nonaktifkan</button>
                    <button type="button" onclick="permanentlyDeleteProduct('${product.id}', this)" class="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600">
                      ${trashIcon()}
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function handleProductFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const productId = editingProductId || document.getElementById('product-id')?.value || '';
  const payload = getProductFormPayload();
  const validationMessage = validateAdminProductPayload(payload);

  if (validationMessage) {
    const toastMessage = validationMessage.startsWith('URL gambar')
      ? validationMessage
      : `Validasi form gagal. ${validationMessage}`;
    showToast(toastMessage, 'warning');
    return;
  }

  const submitButton = document.getElementById('product-submit-button');
  setButtonLoading(submitButton, true, productId ? 'Menyimpan...' : 'Menambah...');

  try {
    if (productId) {
      await apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Produk berhasil diperbarui.', 'success');
    } else {
      await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Produk berhasil ditambahkan.', 'success');
    }

    setButtonLoading(submitButton, false);
    resetProductForm();
    await loadAdminProducts();
  } catch (error) {
    showToast(error.message, 'error');
    setButtonLoading(submitButton, false);
  }
}

function updateImagePreview(imageUrl) {
  const preview = document.getElementById('image-preview');
  const empty = document.getElementById('image-preview-empty');

  if (!preview || !empty) return;

  if (!imageUrl) {
    preview.removeAttribute('src');
    preview.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.textContent = 'Preview gambar akan tampil setelah Image URL diisi.';
    return;
  }

  if (!isValidImageUrl(imageUrl)) {
    preview.removeAttribute('src');
    preview.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.textContent = 'URL gambar tidak valid. Gunakan http://, https://, atau data:image/.';
    return;
  }

  preview.onload = () => {
    preview.classList.remove('hidden');
    empty.classList.add('hidden');
  };
  preview.onerror = () => {
    preview.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.textContent = 'Preview gambar tidak tersedia. Periksa URL gambar.';
  };
  preview.src = imageUrl;
}

function updateStockFieldVisibility(category) {
  const form = document.getElementById('product-form');
  const stockField = document.getElementById('stock-field');
  const stockHelper = document.getElementById('stock-helper');
  const stockInput = form ? form.elements.stock : null;
  const tracked = isStockTrackedCategory(category);

  if (stockField) stockField.classList.toggle('hidden', !tracked);
  if (stockHelper) stockHelper.classList.toggle('hidden', tracked || !category);

  if (stockInput) {
    stockInput.required = tracked;
    if (!tracked) stockInput.value = '';
  }
}

function fillProductForm(product) {
  const form = document.getElementById('product-form');
  if (!form || !product) return;

  editingProductId = product.id;
  document.getElementById('product-id').value = product.id;

  [
    'name',
    'image_url',
    'category',
    'material',
    'material_variant',
    'style_theme',
    'dominant_color',
    'room_category',
    'description',
    'price',
    'stock',
    'status'
  ].forEach((field) => {
    const input = form.elements[field];
    if (input) input.value = product[field] ?? '';
  });

  setText('product-form-title', 'Edit Produk');
  setText('product-submit-button', 'Simpan Perubahan');
  showElement('cancel-edit-button');
  updateImagePreview(product.image_url);
  updateStockFieldVisibility(product.category);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function fillProductFormById(productId) {
  try {
    const product = await fetchAdminProductDetail(productId);
    fillProductForm(product);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function resetProductForm() {
  const form = document.getElementById('product-form');
  if (!form) return;

  editingProductId = '';
  document.getElementById('product-id').value = '';
  form.reset();
  if (form.elements.status) form.elements.status.value = 'active';
  if (form.elements.material_variant) form.elements.material_variant.value = 'Tidak Ada';
  setText('product-form-title', 'Tambah Produk');
  setText('product-submit-button', 'Tambah Produk');
  hideElement('cancel-edit-button');
  updateImagePreview('');
  updateStockFieldVisibility('');
}

function isProductFormDirty() {
  const form = document.getElementById('product-form');
  if (!form) return false;

  const data = new FormData(form);
  return Array.from(data.entries()).some(([key, value]) => {
    if (key === 'status' && value === 'active' && !editingProductId) {
      return false;
    }

    if (key === 'material_variant' && value === 'Tidak Ada' && !editingProductId) {
      return false;
    }

    return String(value || '').trim() !== '';
  });
}

function cancelEditProduct() {
  if (isProductFormDirty() && !showConfirm('Batalkan edit dan kosongkan form?')) {
    return;
  }

  resetProductForm();
}

async function deactivateProduct(productId, button) {
  const confirmed = showConfirm('Apakah Anda yakin ingin menonaktifkan produk ini?');
  if (!confirmed) return;

  setButtonLoading(button, true, 'Proses...');

  try {
    await apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    });
    showToast('Produk berhasil dinonaktifkan.', 'success');
    await loadAdminProducts();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(button, false);
  }
}

async function permanentlyDeleteProduct(productId, button) {
  const confirmed = showConfirm(
    'Produk akan dihapus permanen.\nSemua aktivitas user terkait produk ini, seperti like, wishlist, dan riwayat interaksi, juga akan ikut dihapus.\nAksi ini tidak dapat dibatalkan. Lanjutkan?'
  );
  if (!confirmed) return;

  setButtonLoading(button, true, 'Delete...');

  try {
    const response = await apiRequest(`/admin/products/${encodeURIComponent(productId)}/permanent`, {
      method: 'DELETE'
    });

    if (editingProductId === productId) {
      resetProductForm();
    }

    if (response.data && response.data.deleted_related_activity) {
      console.info('Deleted related product activity:', response.data.deleted_related_activity);
    }

    showToast('Produk berhasil dihapus permanen.', 'success');
    await loadAdminProducts();
  } catch (error) {
    console.error('Permanent delete product failed:', error);
    showToast('Gagal menghapus produk permanen.', 'error');
  } finally {
    setButtonLoading(button, false);
    if (button) {
      button.innerHTML = `${trashIcon()}<span>Delete</span>`;
    }
  }
}

function setupAdminProductEvents() {
  const form = document.getElementById('product-form');
  const filterForm = document.getElementById('product-filter-form');
  const cancelButton = document.getElementById('cancel-edit-button');
  const resetButton = document.getElementById('reset-form-button');
  const imageInput = form ? form.elements.image_url : null;
  const categoryInput = form ? form.elements.category : null;

  if (form && !form.dataset.ready) {
    form.addEventListener('submit', handleProductFormSubmit);
    form.dataset.ready = 'true';
  }

  if (filterForm && !filterForm.dataset.ready) {
    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      loadAdminProducts();
    });
    filterForm.dataset.ready = 'true';
  }

  if (cancelButton && !cancelButton.dataset.ready) {
    cancelButton.addEventListener('click', cancelEditProduct);
    cancelButton.dataset.ready = 'true';
  }

  if (resetButton && !resetButton.dataset.ready) {
    resetButton.addEventListener('click', () => {
      if (isProductFormDirty() && !showConfirm('Reset semua field form produk?')) {
        return;
      }

      resetProductForm();
    });
    resetButton.dataset.ready = 'true';
  }

  if (imageInput && !imageInput.dataset.ready) {
    imageInput.addEventListener('input', () => updateImagePreview(imageInput.value.trim()));
    imageInput.dataset.ready = 'true';
  }

  if (categoryInput && !categoryInput.dataset.ready) {
    categoryInput.addEventListener('change', () => {
      updateStockFieldVisibility(categoryInput.value);
    });
    categoryInput.dataset.ready = 'true';
    updateStockFieldVisibility(categoryInput.value);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'admin-dashboard') {
    loadAdminDashboard();
  }

  if (document.body.dataset.page === 'admin-products') {
    loadAdminProducts();
  }
});

window.loadAdminProducts = loadAdminProducts;
window.renderAdminProductTable = renderAdminProductTable;
window.handleProductFormSubmit = handleProductFormSubmit;
window.fillProductForm = fillProductForm;
window.fillProductFormById = fillProductFormById;
window.resetProductForm = resetProductForm;
window.deactivateProduct = deactivateProduct;
window.permanentlyDeleteProduct = permanentlyDeleteProduct;
window.cancelEditProduct = cancelEditProduct;

/* ═══════════════════════════════════════════════════════════════
   Admin Dashboard JavaScript
   Login, CRUD products, manage orders
   ═══════════════════════════════════════════════════════════════ */

// ── Admin Login ──────────────────────────────────────────
async function handleAdminLogin(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('#admin-username').value;
  const password = form.querySelector('#admin-password').value;
  const errorEl = form.querySelector('.login-error');

  try {
    const { token, username: user } = await APP.api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem('sg_admin_token', token);
    window.location.href = '/admin/dashboard.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Invalid credentials';
    errorEl.classList.add('show');
    form.style.animation = 'shake 0.4s ease';
    setTimeout(() => form.style.animation = '', 400);
  }
}

// ── Dashboard ────────────────────────────────────────────
let adminProducts = [];
let adminOrders = [];

async function initDashboard() {
  const token = localStorage.getItem('sg_admin_token');
  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  try {
    await Promise.all([loadAdminProducts(), loadAdminOrders()]);
    updateStats();
    initTabs();
  } catch (err) {
    if (err.message.includes('Unauthorized')) {
      localStorage.removeItem('sg_admin_token');
      window.location.href = '/admin/login.html';
    }
  }
}

function initTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

function updateStats() {
  const totalProducts = adminProducts.length;
  const totalOrders = adminOrders.length;
  const revenue = adminOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pending = adminOrders.filter(o => o.status === 'Pending').length;

  document.getElementById('stat-products').textContent = totalProducts;
  document.getElementById('stat-orders').textContent = totalOrders;
  document.getElementById('stat-revenue').textContent = APP.formatPrice(revenue);
  document.getElementById('stat-pending').textContent = pending;
}

// ── Products Management ──────────────────────────────────
async function loadAdminProducts() {
  adminProducts = await APP.api('/api/products');
  renderAdminProducts();
}

function renderAdminProducts() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminProducts.map(p => `
    <tr>
      <td>
        <div class="table-product-cell">
          <div class="table-product-image">
            ${p.images?.[0] 
              ? `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm)">`
              : `<div style="width:100%;height:100%;background:var(--accent-light);display:flex;align-items:center;justify-content:center">
                   ${p.category === 'women' ? '👗' : p.type === 'pants' ? '👖' : '👕'}
                 </div>`
            }
          </div>
          <div>
            <div style="font-weight:600">${p.name}</div>
            <div style="font-size:var(--fs-xs);color:var(--text-secondary)">${p.brand}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-accent">${p.category}</span></td>
      <td style="font-weight:600">${APP.formatPrice(p.price)}</td>
      <td>${p.sizes.join(', ')}</td>
      <td>${p.rating}</td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn" onclick="editProduct('${p.id}')" title="Edit">✏️</button>
          <button class="table-action-btn delete" onclick="deleteProduct('${p.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function showProductModal(product = null) {
  const isEdit = !!product;
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');

  document.querySelector('#product-modal .modal-header h3').textContent = isEdit ? 'Edit Product' : 'Add New Product';

  form.querySelector('#pf-name').value = product?.name || '';
  form.querySelector('#pf-brand').value = product?.brand || '';
  form.querySelector('#pf-price').value = product?.price || '';
  form.querySelector('#pf-description').value = product?.description || '';
  form.querySelector('#pf-category').value = product?.category || 'men';
  form.querySelector('#pf-type').value = product?.type || 'shirt';
  form.querySelector('#pf-rating').value = product?.rating || 4.5;
  form.querySelector('#pf-image').value = product?.images?.[0] || '';

  // Set sizes
  const allSizes = ['S', 'M', 'L', 'XL', '38', '40', '42'];
  allSizes.forEach(s => {
    const cb = form.querySelector(`[data-size="${s}"]`);
    if (cb) {
      const isChecked = product?.sizes?.includes(s);
      cb.classList.toggle('checked', isChecked);
      cb.querySelector('input').checked = isChecked;
    }
  });

  form.dataset.editId = product?.id || '';
  
  // Set preview
  const preview = document.getElementById('pf-preview');
  if (product?.images?.length > 0) {
    preview.innerHTML = `<img src="${product.images[0]}" alt="Preview">`;
  } else {
    preview.innerHTML = `<span>No Photo</span>`;
  }
  document.getElementById('pf-file').value = ''; // Clear file input

  modal.classList.add('active');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
}

async function handleProductForm(e) {
  e.preventDefault();
  const form = e.target;
  const isEdit = !!form.dataset.editId;

  const sizes = [];
  form.querySelectorAll('.size-checkbox.checked input').forEach(cb => sizes.push(cb.value));

  const data = {
    name: form.querySelector('#pf-name').value,
    brand: form.querySelector('#pf-brand').value,
    price: Number(form.querySelector('#pf-price').value),
    description: form.querySelector('#pf-description').value,
    category: form.querySelector('#pf-category').value,
    type: form.querySelector('#pf-type').value,
    rating: Number(form.querySelector('#pf-rating').value),
    sizes: sizes,
    images: form.querySelector('#pf-image').value ? [form.querySelector('#pf-image').value] : []
  };

  try {
    if (isEdit) {
      await APP.api(`/api/products/${form.dataset.editId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      APP.showToast('Product updated', '✅');
    } else {
      await APP.api('/api/products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      APP.showToast('Product created', '✅');
    }
    closeProductModal();
    await loadAdminProducts();
    updateStats();
  } catch (err) {
    APP.showToast(err.message, '❌');
  }
}

async function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;

  // Show local preview immediately
  const reader = new FileReader();
  const preview = document.getElementById('pf-preview');
  preview.innerHTML = `<p style="font-size:10px">Uploading...</p>`;

  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="opacity:0.5">`;
  };
  reader.readAsDataURL(file);

  // Upload to server
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sg_admin_token')}`
      },
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');

    const { url } = await res.json();
    document.getElementById('pf-image').value = url;
    preview.innerHTML = `<img src="${url}" alt="Preview">`;
    APP.showToast('Photo uploaded', '📸');
  } catch (err) {
    APP.showToast(err.message, '❌');
    preview.innerHTML = `<span>Error</span>`;
  }
}

function editProduct(id) {
  const product = adminProducts.find(p => p.id === id);
  if (product) showProductModal(product);
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await APP.api(`/api/products/${id}`, { method: 'DELETE' });
    APP.showToast('Product deleted', '🗑️');
    await loadAdminProducts();
    updateStats();
  } catch (err) {
    APP.showToast(err.message, '❌');
  }
}

function toggleSizeCheckbox(el) {
  const cb = el.querySelector('input');
  cb.checked = !cb.checked;
  el.classList.toggle('checked', cb.checked);
}

// ── Orders Management ────────────────────────────────────
async function loadAdminOrders() {
  adminOrders = await APP.api('/api/orders');
  renderAdminOrders();
}

function renderAdminOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (adminOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-2xl);color:var(--text-secondary)">No orders yet</td></tr>';
    return;
  }

  tbody.innerHTML = adminOrders.map(o => `
    <tr>
      <td style="font-weight:500;font-size:var(--fs-xs)">${o.id.slice(0, 8)}...</td>
      <td>
        <div style="font-weight:600">${o.customerName}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary)">${o.phone}</div>
      </td>
      <td style="font-size:var(--fs-xs)">${o.items.map(i => `${i.name} (${i.size} ×${i.qty})`).join(', ')}</td>
      <td style="font-weight:600">${APP.formatPrice(o.totalPrice)}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>📦 Shipped</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
          <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
      </td>
      <td style="font-size:var(--fs-xs);color:var(--text-secondary)">${new Date(o.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await APP.api(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    APP.showToast(`Order ${status.toLowerCase()}`, '✅');
    await loadAdminOrders();
    updateStats();
  } catch (err) {
    APP.showToast(err.message, '❌');
  }
}

function adminLogout() {
  localStorage.removeItem('sg_admin_token');
  window.location.href = '/admin/login.html';
}

// Add shake animation for login
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`;
document.head.appendChild(shakeStyle);

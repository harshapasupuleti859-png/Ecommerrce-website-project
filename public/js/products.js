/* ═══════════════════════════════════════════════════════════════
   Products Listing Page JavaScript
   ═══════════════════════════════════════════════════════════════ */

let allProducts = [];
let filters = { category: '', type: '', brand: '', search: '', sort: '' };

document.addEventListener('DOMContentLoaded', async () => {
  // Check URL params for pre-set filters
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) filters.category = params.get('category');
  if (params.get('type')) filters.type = params.get('type');
  if (params.get('brand')) filters.brand = params.get('brand');

  await loadProducts();
  initFilters();
  initSearch();
});

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = Array(8).fill(APP.productSkeleton()).join('');

  try {
    allProducts = await APP.api('/api/products');
    renderProducts();
  } catch (err) {
    grid.innerHTML = '<div class="no-products"><p>Unable to load products. Please try again.</p></div>';
  }
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  let filtered = [...allProducts];

  if (filters.category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.type) {
    filtered = filtered.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
  }
  if (filters.brand) {
    filtered = filtered.filter(p => p.brand.toLowerCase() === filters.brand.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (filters.sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  if (filters.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-products">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card fade-in" onclick="window.location.href='/product.html?id=${p.id}'">
      <div class="product-card-image">
        ${p.images?.[0] 
          ? `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block">`
          : `<div style="width:100%;height:100%;background:linear-gradient(135deg, var(--bg-tertiary) 0%, var(--accent-light) 100%);display:flex;align-items:center;justify-content:center;font-size:3rem;">
              ${p.category === 'women' ? '👗' : p.type === 'pants' ? '👖' : '👕'}
            </div>`
        }
        <button class="product-card-wishlist ${APP.isWishlisted(p.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishBtn('${p.id}', this)">
          ${APP.isWishlisted(p.id) ? '❤️' : '🤍'}
        </button>
        ${p.rating >= 4.8 ? '<span class="product-card-badge badge badge-accent">Top Rated</span>' : ''}
      </div>
      <div class="product-card-info">
        <div class="product-card-brand">${p.brand}</div>
        <div class="product-card-name">${p.name}</div>
        ${APP.starsHTML(p.rating)}
        <div class="product-card-price-row">
          <span class="product-card-price">${APP.formatPrice(p.price)}</span>
        </div>
      </div>
    </div>
  `).join('');

  APP.initScrollAnimations();
}

function toggleWishBtn(id, btn) {
  const isActive = APP.toggleWishlist(id);
  btn.classList.toggle('active', isActive);
  btn.innerHTML = isActive ? '❤️' : '🤍';
}

function initFilters() {
  // Category filters
  document.querySelectorAll('.filter-btn[data-category]').forEach(btn => {
    if (filters.category && btn.dataset.category === filters.category) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-category]').forEach(b => b.classList.remove('active'));
      if (filters.category === btn.dataset.category) {
        filters.category = '';
      } else {
        filters.category = btn.dataset.category;
        btn.classList.add('active');
      }
      renderProducts();
    });
  });

  // Brand filters
  document.querySelectorAll('.filter-btn[data-brand]').forEach(btn => {
    if (filters.brand && btn.dataset.brand === filters.brand) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-brand]').forEach(b => b.classList.remove('active'));
      if (filters.brand === btn.dataset.brand) {
        filters.brand = '';
      } else {
        filters.brand = btn.dataset.brand;
        btn.classList.add('active');
      }
      renderProducts();
    });
  });

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filters.sort = sortSelect.value;
      renderProducts();
    });
  }
}

function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  let debounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      filters.search = searchInput.value;
      renderProducts();
    }, 300);
  });
}

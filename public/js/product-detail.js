/* ═══════════════════════════════════════════════════════════════
   Product Detail Page JavaScript
   ═══════════════════════════════════════════════════════════════ */

let currentProduct = null;
let selectedSize = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.href = '/products.html';
    return;
  }
  await loadProduct(id);
});

async function loadProduct(id) {
  try {
    currentProduct = await APP.api(`/api/products/${id}`);
    renderProduct();
  } catch (err) {
    document.getElementById('product-container').innerHTML = `
      <div class="text-center" style="padding:var(--space-4xl) 0">
        <h2>Product not found</h2>
        <p class="mt-md" style="color:var(--text-secondary)">The product you're looking for doesn't exist.</p>
        <a href="/products.html" class="btn btn-primary mt-xl">Browse Products</a>
      </div>`;
  }
}

function renderProduct() {
  const p = currentProduct;
  const container = document.getElementById('product-container');

  const emoji = p.category === 'women' ? '👗' : p.type === 'pants' ? '👖' : '👕';

  container.innerHTML = `
    <div class="product-detail-grid">
      <!-- Gallery -->
      <div class="product-gallery fade-in">
        <div class="product-main-image" id="main-image">
          ${p.images?.[0] 
            ? `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block">`
            : `<div style="width:100%;height:100%;background:linear-gradient(135deg, var(--bg-tertiary) 0%, var(--accent-light) 100%);display:flex;align-items:center;justify-content:center;font-size:6rem;">
                ${emoji}
              </div>`
          }
          <span class="zoom-hint">Hover to zoom</span>
        </div>
      </div>

      <!-- Info -->
      <div class="product-info fade-in-right">
        <div class="product-breadcrumb">
          <a href="/">Home</a>
          <span>›</span>
          <a href="/products.html">Shop</a>
          <span>›</span>
          <a href="/products.html?category=${p.category}">${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</a>
        </div>

        <span class="brand">${p.brand}</span>
        <h1 class="name">${p.name}</h1>

        <div class="product-rating">
          ${APP.starsHTML(p.rating)}
          <span class="value">${p.rating}</span>
        </div>

        <div class="price">${APP.formatPrice(p.price)}</div>

        <p class="description">${p.description}</p>

        <!-- Size Selector -->
        <div class="size-selector">
          <h4>
            Select Size
            <span style="font-weight:400;color:var(--text-tertiary);font-size:var(--fs-xs)">
              ${p.type === 'pants' ? '(Waist)' : ''}
            </span>
          </h4>
          <div class="size-options">
            ${p.sizes.map(s => `
              <button class="size-btn" onclick="selectSize('${s}', this)">${s}</button>
            `).join('')}
          </div>
        </div>

        <!-- Actions -->
        <div class="product-actions">
          <button class="add-to-cart-btn" onclick="handleAddToCart()" id="add-to-cart-btn">
            <span class="btn-text">Add to Bag</span>
            <span class="btn-success">✓ Added!</span>
          </button>
          <button class="wishlist-btn ${APP.isWishlisted(p.id) ? 'active' : ''}" onclick="toggleWishlistDetail()" id="wishlist-btn">
            ${APP.isWishlisted(p.id) ? '❤️' : '🤍'}
          </button>
        </div>

        <!-- Features -->
        <div class="product-features">
          <div class="product-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Premium Quality</span>
          </div>
          <div class="product-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span>Free Shipping</span>
          </div>
          <div class="product-feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span>Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Image zoom on mousemove
  const mainImage = document.getElementById('main-image');
  mainImage.addEventListener('mousemove', (e) => {
    const rect = mainImage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const inner = mainImage.querySelector('div');
    if (inner) inner.style.transformOrigin = `${x}% ${y}%`;
  });

  APP.initScrollAnimations();
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function handleAddToCart() {
  if (!selectedSize) {
    APP.showToast('Please select a size', '⚠️');
    document.querySelector('.size-selector').style.animation = 'shake 0.4s ease';
    setTimeout(() => document.querySelector('.size-selector').style.animation = '', 400);
    return;
  }

  const btn = document.getElementById('add-to-cart-btn');
  APP.addToCart(currentProduct, selectedSize);
  btn.classList.add('added');
  setTimeout(() => btn.classList.remove('added'), 2000);
}

function toggleWishlistDetail() {
  const btn = document.getElementById('wishlist-btn');
  const isActive = APP.toggleWishlist(currentProduct.id);
  btn.classList.toggle('active', isActive);
  btn.innerHTML = isActive ? '❤️' : '🤍';
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`;
document.head.appendChild(style);

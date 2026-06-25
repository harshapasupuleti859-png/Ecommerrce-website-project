/* ═══════════════════════════════════════════════════════════════
   Cart Page JavaScript
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const container = document.getElementById('cart-container');
  const cart = APP.getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <h2>Your bag is empty</h2>
        <p>Looks like you haven't added anything to your bag yet.</p>
        <a href="/products.html" class="btn btn-primary">Explore Collection</a>
      </div>`;
    return;
  }

  const subtotal = APP.getCartTotal();
  const shipping = subtotal >= 2000 ? 0 : 199;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${cart.map(item => `
          <div class="cart-item" id="cart-item-${item.id}-${item.size}">
            <div class="cart-item-image">
              <div style="width:100%;height:100%;background:linear-gradient(135deg, var(--bg-tertiary), var(--accent-light));display:flex;align-items:center;justify-content:center;font-size:2rem;">👕</div>
            </div>
            <div class="cart-item-details">
              <div class="cart-item-brand">${item.brand}</div>
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-size">Size: ${item.size}</div>
              <div class="cart-item-price">${APP.formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-actions">
              <button class="cart-item-remove" onclick="removeItem('${item.id}', '${item.size}')">✕</button>
              <div class="qty-selector">
                <button class="qty-btn" onclick="updateItemQty('${item.id}', '${item.size}', ${item.qty - 1})">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" onclick="updateItemQty('${item.id}', '${item.size}', ${item.qty + 1})">+</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="summary-row">
          <span class="label-text">Subtotal (${APP.getCartCount()} items)</span>
          <span>${APP.formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span class="label-text">Shipping</span>
          <span>${shipping === 0 ? '<span style="color:var(--success)">Free</span>' : APP.formatPrice(shipping)}</span>
        </div>
        ${shipping > 0 ? `<div style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-top:4px">Free shipping on orders above ₹2,000</div>` : ''}
        <div class="summary-row total">
          <span>Total</span>
          <span>${APP.formatPrice(total)}</span>
        </div>
        <a href="/checkout.html" class="btn btn-primary w-full">Proceed to Checkout</a>
        <div class="secure-text">🔒 Secure checkout</div>
      </div>
    </div>
  `;
}

function removeItem(id, size) {
  const el = document.getElementById(`cart-item-${id}-${size}`);
  if (el) {
    el.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      APP.removeFromCart(id, size);
      renderCart();
    }, 300);
  }
}

function updateItemQty(id, size, qty) {
  if (qty < 1) {
    removeItem(id, size);
    return;
  }
  APP.updateQty(id, size, qty);
  renderCart();
}

// Add slide out animation
const style = document.createElement('style');
style.textContent = `@keyframes slideOut{to{opacity:0;transform:translateX(-20px);height:0;padding:0;margin:0;overflow:hidden}}`;
document.head.appendChild(style);

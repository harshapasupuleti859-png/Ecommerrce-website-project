/* ═══════════════════════════════════════════════════════════════
   Checkout Page JavaScript
   Form validation + Razorpay (simulated) integration
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const cart = APP.getCart();
  if (cart.length === 0) {
    window.location.href = '/cart.html';
    return;
  }
  renderCheckout();
});

function renderCheckout() {
  const cart = APP.getCart();
  const subtotal = APP.getCartTotal();
  const shipping = subtotal >= 2000 ? 0 : 199;
  const total = subtotal + shipping;

  const orderSummary = document.getElementById('checkout-summary');
  if (orderSummary) {
    orderSummary.innerHTML = `
      <h3>Your Order</h3>
      <div class="order-items-list">
        ${cart.map(item => `
          <div class="order-item">
            <div class="order-item-image">
              <div style="width:100%;height:100%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center">👕</div>
            </div>
            <div class="order-item-info">
              <div class="name">${item.name}</div>
              <div class="meta">Size: ${item.size} · Qty: ${item.qty}</div>
            </div>
            <div class="order-item-price">${APP.formatPrice(item.price * item.qty)}</div>
          </div>
        `).join('')}
      </div>
      <div class="summary-row">
        <span class="label-text">Subtotal</span>
        <span>${APP.formatPrice(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span class="label-text">Shipping</span>
        <span>${shipping === 0 ? '<span style="color:var(--success)">Free</span>' : APP.formatPrice(shipping)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span id="checkout-total">${APP.formatPrice(total)}</span>
      </div>
    `;
  }
}

async function handleCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const fields = {
    name: form.querySelector('#checkout-name'),
    phone: form.querySelector('#checkout-phone'),
    address: form.querySelector('#checkout-address'),
    pincode: form.querySelector('#checkout-pincode')
  };

  // Reset errors
  Object.values(fields).forEach(f => f.classList.remove('input-error'));

  // Validate
  let valid = true;
  if (!fields.name.value.trim()) { fields.name.classList.add('input-error'); valid = false; }
  if (!fields.phone.value.trim() || fields.phone.value.length < 10) { fields.phone.classList.add('input-error'); valid = false; }
  if (!fields.address.value.trim()) { fields.address.classList.add('input-error'); valid = false; }
  if (!fields.pincode.value.trim() || fields.pincode.value.length < 6) { fields.pincode.classList.add('input-error'); valid = false; }

  if (!valid) {
    APP.showToast('Please fill all fields correctly', '⚠️');
    return;
  }

  const cart = APP.getCart();
  const subtotal = APP.getCartTotal();
  const shipping = subtotal >= 2000 ? 0 : 199;
  const total = subtotal + shipping;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    // Create payment order
    const paymentOrder = await APP.api('/api/payment/create', {
      method: 'POST',
      body: JSON.stringify({ amount: total })
    });

    // Simulate Razorpay payment (in production, use actual Razorpay checkout)
    // For demo, we simulate a successful payment
    const paymentResult = await simulatePayment(paymentOrder, total, fields.name.value);

    // Verify payment
    const verification = await APP.api('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: paymentOrder.id,
        razorpay_payment_id: paymentResult.paymentId,
        razorpay_signature: 'demo_signature'
      })
    });

    // Create order
    const order = await APP.api('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        address: fields.address.value.trim(),
        pincode: fields.pincode.value.trim(),
        items: cart,
        totalPrice: total,
        paymentId: paymentResult.paymentId
      })
    });

    // Clear cart
    APP.setCart([]);

    // Show success
    showOrderSuccess(order);
  } catch (err) {
    APP.showToast('Payment failed. Please try again.', '❌');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
  }
}

function simulatePayment(order, amount, name) {
  return new Promise((resolve) => {
    // Show payment modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal" style="text-align:center">
        <div style="font-size:3rem;margin-bottom:var(--space-md)">💳</div>
        <h3 style="margin-bottom:var(--space-sm)">Processing Payment</h3>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-md)">Amount: ${APP.formatPrice(amount)}</p>
        <div style="display:flex;justify-content:center">
          <div class="skeleton" style="width:200px;height:4px;border-radius:2px"></div>
        </div>
        <p style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-top:var(--space-lg)">Razorpay Test Mode</p>
      </div>
    `;
    document.body.appendChild(modal);

    // Simulate processing time
    setTimeout(() => {
      modal.remove();
      resolve({
        paymentId: 'pay_demo_' + Date.now(),
        orderId: order.id
      });
    }, 2000);
  });
}

function showOrderSuccess(order) {
  const main = document.querySelector('.checkout-page .container');
  main.innerHTML = `
    <div class="text-center" style="padding:var(--space-4xl) 0">
      <div style="font-size:5rem;margin-bottom:var(--space-lg);animation:scaleInBounce 0.5s var(--ease-spring)">🎉</div>
      <h1 class="heading-2" style="margin-bottom:var(--space-md)">Order Placed!</h1>
      <p style="color:var(--text-secondary);font-size:var(--fs-md);max-width:400px;margin:0 auto var(--space-lg)">
        Thank you for shopping with Styli Genie. Your order has been confirmed.
      </p>
      <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-xl);max-width:400px;margin:0 auto var(--space-xl);text-align:left">
        <div class="summary-row"><span class="label-text">Order ID</span><span style="font-weight:600">${order.id.slice(0, 8)}...</span></div>
        <div class="summary-row"><span class="label-text">Payment</span><span class="badge badge-success">Confirmed</span></div>
        <div class="summary-row"><span class="label-text">Status</span><span class="badge badge-warning">Pending</span></div>
        <div class="summary-row total"><span>Total</span><span>${APP.formatPrice(order.totalPrice)}</span></div>
      </div>
      <a href="/" class="btn btn-primary">Continue Shopping</a>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes scaleInBounce{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}`;
  document.head.appendChild(style);
}

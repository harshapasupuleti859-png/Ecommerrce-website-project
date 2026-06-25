/* ═══════════════════════════════════════════════════════════════
   Global App JavaScript
   Cart state, dark mode, scroll animations, toast system
   ═══════════════════════════════════════════════════════════════ */

const APP = {
  API: '',  // Same origin

  // ── Cart State ────────────────────────────────────────
  getCart() {
    return JSON.parse(localStorage.getItem('sg_cart') || '[]');
  },

  setCart(cart) {
    localStorage.setItem('sg_cart', JSON.stringify(cart));
    this.updateCartCount();
  },

  addToCart(product, size, qty = 1) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(i => i.id === product.id && i.size === size);
    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images?.[0] || '',
        size: size,
        qty: qty
      });
    }
    this.setCart(cart);
    this.showToast('Added to bag', '🛍️');
  },

  removeFromCart(id, size) {
    let cart = this.getCart();
    cart = cart.filter(i => !(i.id === id && i.size === size));
    this.setCart(cart);
  },

  updateQty(id, size, qty) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === id && i.size === size);
    if (item) {
      item.qty = Math.max(1, qty);
      this.setCart(cart);
    }
  },

  getCartTotal() {
    return this.getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  getCartCount() {
    return this.getCart().reduce((sum, i) => sum + i.qty, 0);
  },

  updateCartCount() {
    document.querySelectorAll('.cart-count-badge').forEach(el => {
      const count = this.getCartCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ── Wishlist State ────────────────────────────────────
  getWishlist() {
    return JSON.parse(localStorage.getItem('sg_wishlist') || '[]');
  },

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    if (index > -1) {
      wishlist.splice(index, 1);
      this.showToast('Removed from wishlist', '💔');
    } else {
      wishlist.push(productId);
      this.showToast('Added to wishlist', '❤️');
    }
    localStorage.setItem('sg_wishlist', JSON.stringify(wishlist));
    return wishlist.includes(productId);
  },

  isWishlisted(productId) {
    return this.getWishlist().includes(productId);
  },

  // ── Dark Mode ─────────────────────────────────────────
  initTheme() {
    const saved = localStorage.getItem('sg_theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this.updateThemeIcon();
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sg_theme', next);
    this.updateThemeIcon();
  },

  updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = isDark ? '☀️' : '🌙';
    });
  },

  // ── Toast Notifications ───────────────────────────────
  showToast(message, icon = '✓') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },

  // ── Scroll Animations ─────────────────────────────────
  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
      observer.observe(el);
    });
  },

  // ── Nav Scroll Effect ─────────────────────────────────
  initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  },

  // ── Mobile Nav ────────────────────────────────────────
  initMobileNav() {
    const toggle = document.querySelector('.nav-mobile-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      links.classList.toggle('active');
      const isOpen = links.classList.contains('active');
      toggle.children[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
      toggle.children[1].style.opacity = isOpen ? '0' : '1';
      toggle.children[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('active');
        toggle.children[0].style.transform = '';
        toggle.children[1].style.opacity = '1';
        toggle.children[2].style.transform = '';
      });
    });
  },

  // ── Star Rating HTML ──────────────────────────────────
  starsHTML(rating) {
    let html = '<div class="stars">';
    for (let i = 1; i <= 5; i++) {
      const cls = i <= Math.round(rating) ? '' : 'empty';
      html += `<svg class="${cls}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }
    html += '</div>';
    return html;
  },

  // ── Format Price ──────────────────────────────────────
  formatPrice(price) {
    return '₹' + price.toLocaleString('en-IN');
  },

  // ── Skeleton Loader ───────────────────────────────────
  productSkeleton() {
    return `
      <div class="product-card">
        <div class="product-card-image skeleton" style="height:280px"></div>
        <div class="product-card-info">
          <div class="skeleton" style="height:12px;width:60%;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:16px;width:90%;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:14px;width:40%;"></div>
        </div>
      </div>
    `;
  },

  // ── API Helper ────────────────────────────────────────
  async api(path, options = {}) {
    const token = localStorage.getItem('sg_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${this.API}${path}`, { ...options, headers: { ...headers, ...options.headers } });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  },

  // ── Init ──────────────────────────────────────────────
  init() {
    this.initTheme();
    this.updateCartCount();
    this.initNavScroll();
    this.initMobileNav();
    setTimeout(() => this.initScrollAnimations(), 100);
  }
};

document.addEventListener('DOMContentLoaded', () => APP.init());

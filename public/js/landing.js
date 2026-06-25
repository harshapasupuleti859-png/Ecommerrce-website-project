/* ═══════════════════════════════════════════════════════════════
   Landing Page JavaScript — NEXT LEVEL Edition
   Parallax, testimonials, brands marquee, product loading,
   mouse-tracking letters, scroll-triggered category reveals
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  // Seed products on first visit
  try {
    await fetch('/api/seed', { method: 'POST' });
  } catch (e) { /* ignore */ }

  // Load trending products
  loadTrendingProducts();

  // Init testimonials slider
  initTestimonialsSlider();

  // Init parallax
  initParallax();

  // Init floating letters cursor effect — Next Level
  initFloatingLetters();

  // Init scroll-triggered category reveals
  initCategoryReveals();

  // Init floating particles
  initParticles();

  // Init 3D logo tilt
  init3DLogoTilt();

  // Init 3D category card tilt
  init3DCardTilt();

  // Init cursor spotlight
  initCursorSpotlight();
});

async function loadTrendingProducts() {
  const grid = document.getElementById('trending-grid');
  if (!grid) return;

  // Show skeletons
  grid.innerHTML = Array(4).fill(APP.productSkeleton()).join('');

  try {
    const products = await APP.api('/api/products');
    const trending = products.sort((a, b) => b.rating - a.rating).slice(0, 4);

    grid.innerHTML = trending.map(p => `
      <div class="product-card fade-in" onclick="window.location.href='/product.html?id=${p.id}'">
        <div class="product-card-image">
          ${p.images?.[0] 
            ? `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block">`
            : `<div style="width:100%;height:100%;background:linear-gradient(135deg, var(--bg-tertiary) 0%, var(--accent-light) 100%);display:flex;align-items:center;justify-content:center;font-size:3rem;">
                ${p.category === 'women' ? '👗' : p.type === 'pants' ? '👖' : '👕'}
              </div>`
          }
          <button class="product-card-wishlist ${APP.isWishlisted(p.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleWish('${p.id}', this)">
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

    // Re-init scroll animations for new elements
    APP.initScrollAnimations();
  } catch (err) {
    grid.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--text-secondary)">Unable to load products</p>';
  }
}

function toggleWish(id, btn) {
  const isActive = APP.toggleWishlist(id);
  btn.classList.toggle('active', isActive);
  btn.innerHTML = isActive ? '❤️' : '🤍';
}

function initTestimonialsSlider() {
  const track = document.querySelector('.testimonials-track');
  const dots = document.querySelectorAll('.testimonials-dots button');
  if (!track || dots.length === 0) return;

  let current = 0;
  const total = dots.length;

  function goTo(index) {
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  // Auto-slide
  setInterval(() => {
    goTo((current + 1) % total);
  }, 5000);
}

function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  const meshOrb = document.querySelector('.hero-mesh-orb');
  const heroLogo = document.querySelector('.hero-logo-img');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroBg) {
      heroBg.style.transform = `translateY(${scrolled * 0.35}px)`;
    }
    if (meshOrb) {
      meshOrb.style.transform = `translate(-50%, ${scrolled * -0.15}px) scale(${1 + scrolled * 0.0003})`;
    }
    if (heroLogo && scrolled < 600) {
      heroLogo.style.transform = `scale(${1 - scrolled * 0.0005}) rotate(${scrolled * 0.02}deg)`;
    }
  });
}

/* ── Next Level Floating Letters — Mouse Tracking ──────── */
function initFloatingLetters() {
  const container = document.getElementById('hero-floating-text');
  if (!container) return;

  const letters = container.querySelectorAll('.float-letter');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = [];
  let currentY = [];
  let rafId = null;

  // Init positions
  letters.forEach(() => {
    currentX.push(0);
    currentY.push(0);
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    letters.forEach((letter, i) => {
      const rect = letter.getBoundingClientRect();
      const lx = rect.left + rect.width / 2;
      const ly = rect.top + rect.height / 2;

      const dx = mouseX - lx;
      const dy = mouseY - ly;

      const speed = parseFloat(letter.getAttribute('data-speed')) || 0.05;

      // Target positions
      const targetX = dx * speed;
      const targetY = dy * speed;

      // Smooth interpolation (lerp) for buttery movement
      currentX[i] += (targetX - currentX[i]) * 0.08;
      currentY[i] += (targetY - currentY[i]) * 0.08;

      // Add subtle 3D rotation based on distance
      const dist = Math.sqrt(dx * dx + dy * dy);
      const rotateY = (dx * speed * 0.3).toFixed(2);
      const rotateX = (-dy * speed * 0.3).toFixed(2);

      letter.style.transform = `translate(${currentX[i].toFixed(2)}px, ${currentY[i].toFixed(2)}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    });

    rafId = requestAnimationFrame(animate);
  }

  animate();

  // Clean up if page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });
}

/* ── Scroll-Triggered Category Card Reveals ───────────── */
function initCategoryReveals() {
  const cards = document.querySelectorAll('.category-card');
  if (cards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  cards.forEach(card => observer.observe(card));
}

/* ── Floating Particles Generator ─────────────────────── */
function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const PARTICLE_COUNT = 25;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Random position and timing
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (8 + Math.random() * 12) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.opacity = (0.3 + Math.random() * 0.5);

    container.appendChild(particle);
  }
}

/* ── 3D Logo Tilt — Mouse Tracking ────────────────────── */
function init3DLogoTilt() {
  const logo = document.querySelector('.hero-logo-img');
  const wrapper = document.querySelector('.hero-logo-wrapper');
  if (!logo || !wrapper) return;

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    logo.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    logo.style.transition = 'transform 0.1s ease-out';
  });

  wrapper.addEventListener('mouseleave', () => {
    logo.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    logo.style.transition = 'transform 0.5s var(--ease-spring)';
  });
}

/* ── 3D Category Card Tilt ────────────────────────────── */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.category-card');
  if (cards.length === 0) return;

  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.perspective = '800px';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.transition = 'transform 0.15s ease-out';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.6s var(--ease-spring)';
    });
  });
}

/* ── Mouse Cursor Spotlight ──────────────────────────── */
function initCursorSpotlight() {
  const spotlight = document.getElementById('hero-cursor-spotlight');
  const hero = document.getElementById('hero');
  if (!spotlight || !hero) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let rafId = null;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    // Getting coordinates relative to the hero section
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    spotlight.style.opacity = '1';
  });

  hero.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });

  function animateSpotlight() {
    // Smoother lerp for trailing cursor effect
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;

    spotlight.style.left = currentX + 'px';
    spotlight.style.top = currentY + 'px';

    rafId = requestAnimationFrame(animateSpotlight);
  }

  animateSpotlight();
}

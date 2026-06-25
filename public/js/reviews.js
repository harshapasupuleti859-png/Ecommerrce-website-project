/* ═══════════════════════════════════════════════════════════════
   Styli Genie reviews and Trust Elements
   ═══════════════════════════════════════════════════════════════ */

const REVIEWS_DATA = [
  { id: 1, name: "@ryan_k", text: "Quality is just next level! The fit is perfect. 🔥", type: "chat" },
  { id: 2, name: "@aman.dev", text: "Best shirt I've bought this year. Packaging was premium.", type: "chat" },
  { id: 3, name: "@vikram_s", text: "Delivered in 2 days to Hyderabad. Trusted seller indeed!", type: "chat" },
  { id: 4, name: "@neil_fit", text: "Fabric feels like silk. Worth every penny.", type: "chat" },
  { id: 5, name: "@sunny_v", text: "The hoodie is so soft. TQ Styli Genie! 🙏", type: "chat" }
];

const RECENT_ORDERS = [
  "New order from Bangalore just shipped!",
  "Srikalahasti Studio just delivered a premium edit.",
  "New order from Delhi in transit. 📦",
  "Trusted by 5000+ customers across India.",
  "Quality check passed for 42 new orders today."
];

function initReviews() {
  const storiesTrack = document.getElementById('stories-track');
  if (!storiesTrack) return;

  storiesTrack.innerHTML = REVIEWS_DATA.map(review => `
    <div class="story-bubble" onclick="openStory(${review.id})">
      <div class="story-bubble-inner">
        <span>${review.name[1].toUpperCase()}</span>
      </div>
      <div class="story-label">${review.name}</div>
    </div>
  `).join('');

  initOrderTicker();
}

function openStory(id) {
  const review = REVIEWS_DATA.find(r => r.id === id);
  if (!review) return;

  const modal = document.createElement('div');
  modal.className = 'story-modal';
  modal.innerHTML = `
    <div class="story-modal-content">
      <div class="story-modal-header">
        <div class="story-bubble-inner small"><span>${review.name[1].toUpperCase()}</span></div>
        <span>${review.name}</span>
        <button onclick="this.closest('.story-modal').remove()">✕</button>
      </div>
      <div class="story-modal-body">
        <p>"${review.text}"</p>
        <div class="story-modal-footer">Verified Customer ✅</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function initOrderTicker() {
  const ticker = document.getElementById('order-ticker');
  if (!ticker) return;

  let index = 0;
  function updateTicker() {
    ticker.style.opacity = '0';
    setTimeout(() => {
      ticker.innerText = RECENT_ORDERS[index];
      ticker.style.opacity = '1';
      index = (index + 1) % RECENT_ORDERS.length;
    }, 500);
  }

  updateTicker();
  setInterval(updateTicker, 4000);
}

document.addEventListener('DOMContentLoaded', initReviews);

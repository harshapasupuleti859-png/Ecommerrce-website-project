require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data files exist
db.ensureFile('products.json', []);
db.ensureFile('orders.json', []);
db.ensureFile('admin.json', []);

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', require('./routes/upload'));

// Seed endpoint
app.post('/api/seed', (req, res) => {
  const existing = db.read('products.json');
  if (existing.length > 0) {
    return res.json({ message: 'Products already seeded', count: existing.length });
  }

  const products = [
    {
      id: 'prod-001',
      name: 'Oxford Heritage Shirt',
      brand: 'Ralph Lauren',
      price: 4999,
      description: 'Timeless elegance meets modern refinement. This Oxford Heritage Shirt is crafted from premium Egyptian cotton, featuring mother-of-pearl buttons and an impeccable fit that speaks volumes without saying a word.',
      images: ['/assets/products/oxford-shirt.jpg'],
      category: 'men',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.8,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-002',
      name: 'Classic Polo Signature',
      brand: 'U.S. Polo Assn',
      price: 2499,
      description: 'Born from a legacy of sport and sophistication. The Classic Polo Signature combines breathable piqué cotton with a tailored silhouette — effortlessly transitioning from the field to the evening.',
      images: ['/assets/products/polo-shirt.jpg'],
      category: 'men',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-003',
      name: 'Urban Edge Denim Jacket',
      brand: 'Wrogn',
      price: 3999,
      description: 'For the ones who write their own rules. The Urban Edge Jacket features distressed detailing, reinforced stitching, and a cut that moves with your ambition. Street-ready. Statement-worthy.',
      images: ['/assets/products/denim-jacket.jpg'],
      category: 'men',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.6,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-004',
      name: 'Horizon Graphic Tee',
      brand: 'Roadster',
      price: 1299,
      description: 'Minimalism meets artistry. The Horizon Tee features a hand-drawn landscape print on 100% organic cotton — soft against the skin, bold in expression. For days that call for effortless style.',
      images: ['/assets/products/graphic-tee.jpg'],
      category: 'casual',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-005',
      name: '501 Original Fit Jeans',
      brand: "Levi's",
      price: 5499,
      description: 'The icon that started it all. Over a century of heritage distilled into every stitch. The 501 Original delivers an authentic straight fit in premium selvedge denim — a masterpiece of understated cool.',
      images: ['/assets/products/levis-jeans.jpg'],
      category: 'men',
      sizes: ['38', '40', '42'],
      type: 'pants',
      rating: 4.9,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-006',
      name: 'Riviera Linen Shirt',
      brand: 'Ralph Lauren',
      price: 6999,
      description: 'Inspired by Mediterranean summers. This Riviera Linen Shirt drapes with effortless sophistication — hand-finished seams, a relaxed spread collar, and a weight that whispers luxury.',
      images: ['/assets/products/linen-shirt.jpg'],
      category: 'premium',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.9,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-007',
      name: 'Striped Rugby Heritage',
      brand: 'U.S. Polo Assn',
      price: 3299,
      description: 'Where tradition meets the modern wardrobe. Bold horizontal stripes on heavyweight cotton jersey — a nod to sporting heritage, reimagined for contemporary elegance.',
      images: ['/assets/products/rugby-polo.jpg'],
      category: 'men',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.4,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-008',
      name: 'Street Elite Joggers',
      brand: 'Wrogn',
      price: 2799,
      description: 'Engineered for movement, designed for impact. These joggers feature a tapered fit with premium French terry, zip pockets, and ribbed cuffs — the perfect fusion of comfort and attitude.',
      images: ['/assets/products/jogger-pants.jpg'],
      category: 'casual',
      sizes: ['38', '40', '42'],
      type: 'pants',
      rating: 4.5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-009',
      name: 'Explorer Cargo Shorts',
      brand: 'Roadster',
      price: 1999,
      description: 'Adventure-ready essentials. These cargo shorts balance utility with clean design — featuring hidden zip pockets, a relaxed fit, and garment-dyed cotton that ages beautifully with every journey.',
      images: ['/assets/products/cargo-shorts.jpg'],
      category: 'casual',
      sizes: ['38', '40', '42'],
      type: 'pants',
      rating: 4.2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-010',
      name: 'Trucker Icon Jacket',
      brand: "Levi's",
      price: 7999,
      description: 'An American legend reinvented. The Trucker Icon in raw selvedge denim develops a unique patina over time — no two jackets age the same. Yours will tell your story.',
      images: ['/assets/products/trucker-jacket.jpg'],
      category: 'premium',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.8,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-011',
      name: 'Ethereal Floral Dress',
      brand: 'Style Genie',
      price: 4499,
      description: 'Where dreams meet fabric. This flowing maxi dress features hand-painted floral motifs on silk-blend chiffon — a piece that moves like water and catches light like a prism.',
      images: ['/assets/products/floral-dress.jpg'],
      category: 'women',
      sizes: ['S', 'M', 'L', 'XL'],
      type: 'shirt',
      rating: 4.7,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-012',
      name: 'Sculpt High-Rise Jeans',
      brand: 'Style Genie',
      price: 3999,
      description: 'Designed to celebrate every curve. The Sculpt High-Rise features our signature stretch denim with recovery technology — holds its shape from morning to midnight. Confidence, tailored.',
      images: ['/assets/products/highrise-jeans.jpg'],
      category: 'women',
      sizes: ['38', '40', '42'],
      type: 'pants',
      rating: 4.6,
      createdAt: new Date().toISOString()
    }
  ];

  products.forEach(p => db.insertOne('products.json', p));
  res.json({ message: 'Seeded successfully', count: products.length });
});

// SPA fallback — serve index.html for non-API, non-file routes
app.get('*', (req, res) => {
  // Check if requesting a specific html file
  const htmlPath = path.join(__dirname, 'public', req.path);
  if (req.path.endsWith('.html') && require('fs').existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ✨ Style Genie Server running at http://localhost:${PORT}\n`);
});

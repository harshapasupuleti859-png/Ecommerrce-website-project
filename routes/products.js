const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const PRODUCTS_FILE = 'products.json';

// GET all products (public) — supports filters
router.get('/', (req, res) => {
  let products = db.read(PRODUCTS_FILE);
  const { category, brand, size, minPrice, maxPrice, search, sort } = req.query;

  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (brand) {
    products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (size) {
    products = products.filter(p => p.sizes && p.sizes.includes(size));
  }
  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(products);
});

// GET single product (public)
router.get('/:id', (req, res) => {
  const product = db.findById(PRODUCTS_FILE, req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST new product (admin only)
router.post('/', auth, (req, res) => {
  const { name, brand, price, description, images, category, sizes, type, rating } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });
  const product = {
    id: uuidv4(),
    name,
    brand: brand || 'Style Genie',
    price: Number(price),
    description: description || '',
    images: images || [],
    category: category || 'men',
    sizes: sizes || ['S', 'M', 'L', 'XL'],
    type: type || 'shirt',
    rating: rating || 4.5,
    createdAt: new Date().toISOString()
  };
  db.insertOne(PRODUCTS_FILE, product);
  res.status(201).json(product);
});

// PUT update product (admin only)
router.put('/:id', auth, (req, res) => {
  const updated = db.updateOne(PRODUCTS_FILE, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

// DELETE product (admin only)
router.delete('/:id', auth, (req, res) => {
  const deleted = db.deleteOne(PRODUCTS_FILE, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

module.exports = router;

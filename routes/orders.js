const express = require('express');
const router = express.Router();
const db = require('../data/db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const ORDERS_FILE = 'orders.json';

// POST create order (public)
router.post('/', (req, res) => {
  const { customerName, phone, address, pincode, items, totalPrice, paymentId } = req.body;
  if (!customerName || !phone || !address || !pincode || !items || !totalPrice) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const order = {
    id: uuidv4(),
    customerName,
    phone,
    address,
    pincode,
    items,
    totalPrice: Number(totalPrice),
    paymentId: paymentId || 'COD',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  db.insertOne(ORDERS_FILE, order);
  res.status(201).json(order);
});

// GET all orders (admin only)
router.get('/', auth, (req, res) => {
  const orders = db.read(ORDERS_FILE);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

// PUT update order status (admin only)
router.put('/:id', auth, (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const updated = db.updateOne(ORDERS_FILE, req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

module.exports = router;

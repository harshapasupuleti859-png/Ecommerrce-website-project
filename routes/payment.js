const express = require('express');
const router = express.Router();

// POST create Razorpay order (simulated in test mode)
router.post('/create', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    // In production, use actual Razorpay SDK:
    // const Razorpay = require('razorpay');
    // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create({ amount: amount * 100, currency: 'INR' });

    // Simulated order for demo/test mode
    const order = {
      id: 'order_' + Date.now() + Math.random().toString(36).substr(2, 9),
      amount: amount * 100,
      currency: 'INR',
      status: 'created'
    };

    res.json(order);
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// POST verify payment (simulated)
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // In production, verify signature with Razorpay SDK
  // For demo, we accept all payments
  res.json({
    verified: true,
    paymentId: razorpay_payment_id || 'pay_demo_' + Date.now()
  });
});

module.exports = router;

const mongoose = require('mongoose');
const Rating = require('../models/Rating');

function serializeRating(r) {
  const o = { ...r, id: r._id.toString() };
  delete o._id;
  ['fromUserId', 'toUserId', 'productId'].forEach((k) => {
    if (o[k]) o[k] = o[k].toString();
  });
  return o;
}

async function getBySeller(req, res) {
  try {
    const list = await Rating.find({ type: 'seller', toUserId: req.params.userId }).sort({ createdAt: -1 }).lean();
    return res.json(list.map(serializeRating));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getByProduct(req, res) {
  try {
    const list = await Rating.find({ type: 'product', productId: req.params.productId }).sort({ createdAt: -1 }).lean();
    return res.json(list.map(serializeRating));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function averageSeller(req, res) {
  try {
    const result = await Rating.aggregate([
      { $match: { type: 'seller', toUserId: new mongoose.Types.ObjectId(req.params.userId) } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    
    const average = result[0]?.average ?? 0;
    const count = result[0]?.count ?? 0;
    return res.json({ average: Math.round(average * 100) / 100, count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function checkSeller(req, res) {
  try {
    const { fromUserId, toUserId } = req.query;
    if (!fromUserId || !toUserId) return res.status(400).json({ error: 'fromUserId and toUserId required' });
    const rating = await Rating.findOne({ type: 'seller', fromUserId, toUserId }).lean();
    if (!rating) return res.json(null);
    return res.json(serializeRating(rating));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function checkProduct(req, res) {
  try {
    const { fromUserId, productId } = req.query;
    if (!fromUserId || !productId) return res.status(400).json({ error: 'fromUserId and productId required' });
    const rating = await Rating.findOne({ type: 'product', fromUserId, productId }).lean();
    if (!rating) return res.json(null);
    return res.json(serializeRating(rating));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const { type, toUserId, productId, rating: ratingValue, comment } = req.body;
    if (!type || !['seller', 'product'].includes(type)) {
      return res.status(400).json({ error: 'type must be seller or product' });
    }
    if (ratingValue == null || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: 'rating must be 1-5' });
    }
    const fromUserId = req.user._id;
    const fromUsername = req.user.username;

    if (type === 'seller') {
      if (!toUserId) return res.status(400).json({ error: 'toUserId required for seller rating' });
      const existing = await Rating.findOne({ type: 'seller', fromUserId, toUserId });
      if (existing) return res.status(400).json({ error: 'You have already rated this seller' });
      const rating = await Rating.create({ type: 'seller', fromUserId, toUserId, fromUsername, rating: ratingValue, comment });
      return res.status(201).json(rating.toJSON());
    } else {
      if (!productId) return res.status(400).json({ error: 'productId required for product rating' });
      const existing = await Rating.findOne({ type: 'product', fromUserId, productId });
      if (existing) return res.status(400).json({ error: 'You have already rated this product' });
      const rating = await Rating.create({ type: 'product', fromUserId, productId, fromUsername, rating: ratingValue, comment });
      return res.status(201).json(rating.toJSON());
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getBySeller, getByProduct, averageSeller, checkSeller, checkProduct, create };

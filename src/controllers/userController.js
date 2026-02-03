const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Rating = require('../models/Rating');

async function getById(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let rating = user.rating;
    if (rating == null || rating === undefined) {
      const agg = await Rating.aggregate([
        { $match: { type: 'seller', toUserId: user._id } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]);
      rating = agg[0]?.avg ?? 0;
    }
    const out = user.toJSON();
    out.rating = rating;
    return res.json(out);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) return res.status(404).json({ error: 'User not found' });
    return res.status(500).json({ error: err.message });
  }
}

async function getByUsername(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    let rating = user.rating;
    if (rating == null || rating === undefined) {
      const agg = await Rating.aggregate([
        { $match: { type: 'seller', toUserId: user._id } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]);
      rating = agg[0]?.avg ?? 0;
    }
    const out = user.toJSON();
    out.rating = rating;
    return res.json(out);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const id = req.params.id;
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Can only update your own profile' });
    }
    const allowed = ['username', 'email', 'bio', 'name', 'surname', 'middleName', 'age', 'area', 'cellNumber', 'location', 'companyName', 'companyNumber', 'companyContact', 'companyAddress', 'companyEmail', 'companyWebsite'];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    if (updates.username) {
      const existing = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
    }
    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ error: 'Email already in use' });
    }
    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user.toJSON());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const id = req.params.id;
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword required' });
    }
    const user = await User.findById(id).select('+passwordHash');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getById, getByUsername, updateProfile, changePassword };

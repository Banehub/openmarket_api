const mongoose = require('mongoose');
const Listing = require('../models/Listing');

const defaultLimit = 50;
const defaultOffset = 0;

async function list(req, res) {
  try {
    const { search, category, sort = 'newest', limit = defaultLimit, offset = defaultOffset } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const sortOpt = sort === 'price-low' ? { price: 1 } : sort === 'price-high' ? { price: -1 } : { createdAt: -1 };
    const [list, total] = await Promise.all([
      Listing.find(filter).sort(sortOpt).skip(Number(offset)).limit(Math.min(Number(limit), 100)).populate('sellerId', 'username verified rating').lean(),
      Listing.countDocuments(filter),
    ]);
    const listWithSeller = list.map((l) => {
      const x = { ...l, id: l._id.toString() };
      delete x._id;
      if (x.sellerId) {
        x.seller = { id: x.sellerId._id.toString(), username: x.sellerId.username, verified: x.sellerId.verified, rating: x.sellerId.rating ?? 0 };
        delete x.sellerId;
      }
      return x;
    });
    return res.json({ list: listWithSeller, total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function featured(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 50);
    const list = await Listing.find().sort({ createdAt: -1 }).limit(limit).populate('sellerId', 'username verified rating').lean();
    const listWithSeller = list.map((l) => {
      const x = { ...l, id: l._id.toString() };
      delete x._id;
      if (x.sellerId) {
        x.seller = { id: x.sellerId._id.toString(), username: x.sellerId.username, verified: x.sellerId.verified, rating: x.sellerId.rating ?? 0 };
        delete x.sellerId;
      }
      return x;
    });
    return res.json(listWithSeller);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getById(req, res) {
  try {
    const listing = await Listing.findById(req.params.id).populate('sellerId', 'username verified rating').lean();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    const x = { ...listing, id: listing._id.toString() };
    delete x._id;
    if (x.sellerId) {
      x.seller = { id: x.sellerId._id.toString(), username: x.sellerId.username, verified: x.sellerId.verified, rating: x.sellerId.rating ?? 0 };
      delete x.sellerId;
    }
    return res.json(x);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) return res.status(404).json({ error: 'Listing not found' });
    return res.status(500).json({ error: err.message });
  }
}

async function getBySeller(req, res) {
  try {
    const list = await Listing.find({ sellerId: req.params.sellerId }).populate('sellerId', 'username verified rating').lean();
    const listWithSeller = list.map((l) => {
      const x = { ...l, id: l._id.toString() };
      delete x._id;
      if (x.sellerId) {
        x.seller = { id: x.sellerId._id.toString(), username: x.sellerId.username, verified: x.sellerId.verified, rating: x.sellerId.rating ?? 0 };
        delete x.sellerId;
      }
      return x;
    });
    return res.json(listWithSeller);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const { title, price, category, description, images } = req.body;
    if (!title || price == null || !category || !description || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'title, price, category, description, and at least one image required' });
    }
    const listing = await Listing.create({
      title,
      price: Number(price),
      category,
      description,
      images,
      sellerId: req.user._id,
    });
    const populated = await Listing.findById(listing._id).populate('sellerId', 'username verified rating').lean();
    const x = { ...populated, id: populated._id.toString() };
    delete x._id;
    if (x.sellerId) {
      x.seller = { id: x.sellerId._id.toString(), username: x.sellerId.username, verified: x.sellerId.verified, rating: x.sellerId.rating ?? 0 };
      delete x.sellerId;
    }
    return res.status(201).json(x);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the owner can update this listing' });
    }
    const allowed = ['title', 'price', 'category', 'description', 'images'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) listing[k] = req.body[k];
    }
    await listing.save();
    const populated = await Listing.findById(listing._id).populate('sellerId', 'username verified rating').lean();
    const x = { ...populated, id: populated._id.toString() };
    delete x._id;
    if (x.sellerId) {
      x.seller = { id: x.sellerId._id.toString(), username: x.sellerId.username, verified: x.sellerId.verified, rating: x.sellerId.rating ?? 0 };
      delete x.sellerId;
    }
    return res.json(x);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) return res.status(404).json({ error: 'Listing not found' });
    return res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the owner can delete this listing' });
    }
    await Listing.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) return res.status(404).json({ error: 'Listing not found' });
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { list, featured, getById, getBySeller, create, update, remove };

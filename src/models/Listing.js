const mongoose = require('mongoose');

const CATEGORIES = ['Electronics', 'Fashion', 'Furniture', 'Sports', 'Entertainment', 'Books'];

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: CATEGORIES },
    description: { type: String, required: true },
    images: { type: [String], required: true, validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: 'At least one image URL required' } },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

listingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  if (obj._id) delete obj._id;
  if (obj.sellerId && obj.sellerId._id) obj.sellerId = { ...obj.sellerId, id: obj.sellerId._id.toString(), _id: undefined };
  return obj;
};

module.exports = mongoose.model('Listing', listingSchema);
module.exports.CATEGORIES = CATEGORIES;

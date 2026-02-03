const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['seller', 'product'] },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    fromUsername: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

ratingSchema.index({ type: 1, toUserId: 1, fromUserId: 1 }, { unique: true, partialFilterExpression: { type: 'seller' } });
ratingSchema.index({ type: 1, productId: 1, fromUserId: 1 }, { unique: true, partialFilterExpression: { type: 'product' } });

ratingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  ['fromUserId', 'toUserId', 'productId'].forEach((k) => {
    if (obj[k]) obj[k] = (obj[k]._id || obj[k]).toString();
  });
  return obj;
};

module.exports = mongoose.model('Rating', ratingSchema);

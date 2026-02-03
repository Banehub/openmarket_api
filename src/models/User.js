const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false }, // hashed in controller on register
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    registrationType: { type: String, enum: ['quick', 'full', 'company'] },
    name: String,
    middleName: String,
    surname: String,
    age: Number,
    area: String,
    cellNumber: String,
    idNumber: String,
    passportNumber: String,
    idType: { type: String, enum: ['id', 'passport'] },
    location: String,
    idFileUrl: String,
    companyName: String,
    companyNumber: String,
    companyContact: String,
    companyAddress: String,
    companyEmail: String,
    companyWebsite: String,
    bio: String,
    canBecomeVerifiedSeller: Boolean,
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, default: '', lowercase: true, trim: true },
  email: { type: String, default: '', lowercase: true, trim: true, index: true },
  passwordHash: { type: String, default: '' },
  googleId: { type: String, default: '', index: true },
  profileImage: { type: String, default: '' },
  emailVerified: { type: Boolean, default: false },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  role: {
    type: String,
    enum: ['customer', 'tailor', 'admin'],
    default: 'customer',
    required: true,
  },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.provider && !this.authProvider) {
    this.authProvider = this.provider;
  } else if (this.authProvider && !this.provider) {
    this.provider = this.authProvider;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);

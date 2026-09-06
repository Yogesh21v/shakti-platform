const mongoose = require('mongoose');

const AVATAR_COLORS = ['#8B1A2B', '#1A6B7C', '#D4A017', '#E8660A', '#5A2F7A', '#1A7C3A', '#6B1A8B', '#1A5C8B'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    district: { type: String, default: '' },
    skills: { type: [String], default: [] },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    avatarColor: {
      type: String,
      default: () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    },
    online: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Never send the password hash back in API responses.
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    district: this.district,
    skills: this.skills,
    bio: this.bio,
    role: this.role,
    avatarColor: this.avatarColor,
    avatarInitial: this.name.trim().charAt(0).toUpperCase(),
    online: this.online,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

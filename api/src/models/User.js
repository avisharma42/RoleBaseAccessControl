import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Viewer' },
  active: { type: Boolean, default: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  preferences: {
    securityAlerts: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: false },
    mentions: { type: Boolean, default: true },
    twoFactor: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);

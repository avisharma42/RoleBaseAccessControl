import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  badgeId: { type: String, required: true },
  badgeName: { type: String, required: true },
  badgeCategory: { type: String, required: true }, // posts, kudos, comments, wellbeing, social
  badgeIcon: { type: String, required: true },
  badgeDescription: { type: String, required: true },
  level: { type: Number, default: 1 }, // Bronze, Silver, Gold levels
  earnedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate badges
AchievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model('Achievement', AchievementSchema);

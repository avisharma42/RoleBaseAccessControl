import mongoose from 'mongoose';

const UserStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  
  // Posts stats
  postsCreated: { type: Number, default: 0 },
  postsDeleted: { type: Number, default: 0 },
  
  // Kudos stats
  kudosGiven: { type: Number, default: 0 },
  kudosReceived: { type: Number, default: 0 },
  
  // Comments stats
  commentsPosted: { type: Number, default: 0 },
  repliesReceived: { type: Number, default: 0 },
  
  // Wellbeing stats
  wellbeingCheckIns: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
  
  // Social stats
  mentionsGiven: { type: Number, default: 0 },
  mentionsReceived: { type: Number, default: 0 },
  
  // Overall engagement
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  
  // Timestamps
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('UserStats', UserStatsSchema);

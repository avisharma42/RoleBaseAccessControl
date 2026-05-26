import mongoose from 'mongoose';

const WellbeingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, enum: ['😊', '🙂', '😐', '☹️', '😢'], required: true },
  journal: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Only one check per user per day
WellbeingSchema.index({ userId: 1, timestamp: 1 }, { 
  unique: true,
  partialFilterExpression: {
    timestamp: { 
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999))
    }
  }
});

export default mongoose.model('Wellbeing', WellbeingSchema);
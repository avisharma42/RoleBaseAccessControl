import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  category: { type: String, enum: ['Safety','System improvement','Complaint','Appreciation','Other'], default: 'Other' },
  message: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Feedback', FeedbackSchema);

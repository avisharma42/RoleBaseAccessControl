import mongoose from 'mongoose';

const KudoSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  message: { type: String },
}, { timestamps: true });

// prevent duplicate kudos from same user to same post
KudoSchema.index({ fromUser: 1, postId: 1 }, { unique: true, partialFilterExpression: { postId: { $exists: true } } });

export default mongoose.model('Kudo', KudoSchema);

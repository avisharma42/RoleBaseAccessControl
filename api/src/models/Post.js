import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: { type: [String], default: [] },
  // reactions: { reactionType: [userId] }
  reactions: {
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    celebrate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    idea: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
}, { timestamps: true });

export default mongoose.model('Post', PostSchema);

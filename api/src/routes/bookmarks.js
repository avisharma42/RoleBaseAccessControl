import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get current user's bookmarks
router.get('/', requireAuth, async (req,res)=>{
  const user = await User.findById(req.user.id).lean();
  if(!user) return res.status(404).json({ message: 'User not found' });
  
  const bookmarks = user.bookmarks || [];
  // Populate full post details
  const posts = await Post.find({ _id: { $in: bookmarks } }).sort({createdAt:-1}).lean();
  res.json(posts);
});

// Toggle bookmark
router.post('/:postId', requireAuth, async (req,res)=>{
  const { postId } = req.params;
  const userId = req.user.id;
  
  // Check if post exists
  const post = await Post.findById(postId);
  if(!post) return res.status(404).json({ message: 'Post not found' });
  
  const user = await User.findById(userId);
  if(!user.bookmarks) user.bookmarks = [];
  
  const idx = user.bookmarks.findIndex(id => id.toString() === postId);
  if(idx > -1){
    // Remove bookmark
    user.bookmarks.splice(idx, 1);
    await user.save();
    res.json({ bookmarked: false });
  } else {
    // Add bookmark
    user.bookmarks.push(postId);
    await user.save();
    res.json({ bookmarked: true });
  }
});

// Remove bookmark (alternative DELETE endpoint)
router.delete('/:postId', requireAuth, async (req,res)=>{
  const { postId } = req.params;
  const user = await User.findById(req.user.id);
  if(!user.bookmarks) user.bookmarks = [];
  
  user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
  await user.save();
  res.json({ ok: true });
});

export default router;

import express from 'express';
import Kudo from '../models/Kudo.js';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';
import { trackKudoGiven, trackKudoReceived } from '../utils/statsService.js';

const router = express.Router();

// Give a kudo for a post (authenticated users only)
router.post('/', requireAuth, async (req, res) => {
  try{
    const fromUser = req.user.id;
    const { postId } = req.body || {};
    if(!postId) return res.status(400).json({ message: 'Missing postId' });

    const post = await Post.findById(postId).lean();
    if(!post) return res.status(404).json({ message: 'Post not found' });
    const toUser = String(post.authorId);
    if(String(fromUser) === String(toUser)) return res.status(400).json({ message: 'Cannot kudo your own post' });

    // Check if user already gave a kudo
    const existing = await Kudo.findOne({ fromUser, postId });
    
    if(existing) {
      // Remove existing kudo
      await Kudo.deleteOne({ _id: existing._id });
      const count = await Kudo.countDocuments({ postId });
      return res.json({ ok: true, removed: true, count });
    } else {
      // Give new kudo
      await new Kudo({ fromUser, toUser, postId }).save();
      const count = await Kudo.countDocuments({ postId });
      
      // Track stats and check for achievements
      const giverResult = await trackKudoGiven(fromUser);
      const receiverResult = await trackKudoReceived(toUser);
      const newBadges = [...(giverResult.newBadges || []), ...(receiverResult.newBadges || [])];
      
      return res.json({ ok: true, added: true, count, newBadges });
    }
  }catch(e){
    console.error('Kudo error', e);
    return res.status(500).json({ message: 'Unable to give kudo' });
  }
});

// public: get kudo count for a post (optionally check if user has given)
router.get('/post/:id/count', async (req,res)=>{
  try{
    const postId = req.params.id;
    const count = await Kudo.countDocuments({ postId });
    let hasGiven = false;
    
    // Check if the current user has given a kudo (if authenticated)
    if(req.user && req.user.id){
      const existing = await Kudo.findOne({ fromUser: req.user.id, postId });
      hasGiven = !!existing;
    }
    
    return res.json({ count, hasGiven });
  }catch(e){ res.status(500).json({ message: 'Unable to get count' }); }
});

// public: get user kudos count (total received)
router.get('/user/:id/count', async (req,res)=>{
  try{
    const id = req.params.id;
    const count = await Kudo.countDocuments({ toUser: id });
    return res.json({ count });
  }catch(e){ res.status(500).json({ message: 'Unable to get count' }); }
});

// leaderboard: monthly top givers (users who gave the most kudos)
router.get('/leaderboard/monthly', async (req,res)=>{
  try{
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const agg = await Kudo.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: '$fromUser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    return res.json(agg);
  }catch(e){ res.status(500).json({ message: 'Unable to get leaderboard' }); }
});

export default router;

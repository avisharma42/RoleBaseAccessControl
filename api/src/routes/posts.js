import express from 'express';
import Post from '../models/Post.js';
import { requireAuth, requireRole, ownsOrAdmin } from '../middleware/auth.js';
import { trackPostCreated, trackPostDeleted } from '../utils/statsService.js';

const router = express.Router();

// list + create
router.get('/', requireAuth, async (req,res)=>{
  const q = {};
  // optional tag filter: /posts?tag=tagName
  if(req.query.tag){ q.tags = req.query.tag; }
  const posts = await Post.find(q).sort({createdAt:-1}).limit(100).lean();
  res.json(posts);
});

router.post('/', requireAuth, requireRole(['Admin','Editor']), async (req,res)=>{
  const { title, body, tags } = req.body;
  
  // Extract hashtags from title and body
  const hashtagRegex = /#(\w+)/g;
  const extractedTags = [...(title + ' ' + body).matchAll(hashtagRegex)].map(m => m[1].toLowerCase());
  const manualTags = Array.isArray(tags) ? tags.map(t=>String(t).trim().toLowerCase()).filter(Boolean) : [];
  const allTags = [...new Set([...extractedTags, ...manualTags])];
  
  const p = await Post.create({ title, body, authorId: req.user.id, tags: allTags });
  
  // Track stats and check for achievements
  const { newBadges } = await trackPostCreated(req.user.id);
  
  res.json({ post: p, newBadges });
});

router.get('/:id', requireAuth, async (req,res)=>{
  const p = await Post.findById(req.params.id);
  if(!p) return res.status(404).json({message:'Not found'});
  res.json(p);
});

router.put('/:id', requireAuth, requireRole(['Admin', 'Editor']), async (req,res)=>{
  const { title, body, tags } = req.body;
  
  const update = { title, body };
  
  // Extract hashtags from updated content
  if (title !== undefined || body !== undefined) {
    const hashtagRegex = /#(\w+)/g;
    const extractedTags = [...((title || '') + ' ' + (body || '')).matchAll(hashtagRegex)].map(m => m[1].toLowerCase());
    const manualTags = Array.isArray(tags) ? tags.map(t=>String(t).trim().toLowerCase()).filter(Boolean) : [];
    update.tags = [...new Set([...extractedTags, ...manualTags])];
  }
  
  const p = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(p);
});

router.delete('/:id', requireAuth, ownsOrAdmin(async (req)=>{
  const p = await Post.findById(req.params.id);
  return p?.authorId;
}), async (req,res)=>{
  const post = await Post.findById(req.params.id);
  const authorId = post?.authorId;
  
  await Post.findByIdAndDelete(req.params.id);
  
  // Track deletion
  if (authorId) {
    await trackPostDeleted(authorId);
  }
  
  res.json({ ok:true });
});

// Toggle reaction on a post
router.patch('/:id/react', requireAuth, async (req,res)=>{
  const { type } = req.body; // 'like', 'celebrate', or 'idea'
  const validTypes = ['like', 'celebrate', 'idea'];
  
  if(!validTypes.includes(type)){
    return res.status(400).json({ message: 'Invalid reaction type' });
  }
  
  const post = await Post.findById(req.params.id);
  if(!post) return res.status(404).json({ message: 'Post not found' });
  
  const userId = req.user.id;
  const userIdStr = userId.toString();
  
  // Initialize reactions if not present
  if(!post.reactions) post.reactions = { like: [], celebrate: [], idea: [] };
  if(!post.reactions[type]) post.reactions[type] = [];
  
  // Toggle: remove if already present, add if not
  const idx = post.reactions[type].findIndex(id => id.toString() === userIdStr);
  if(idx > -1){
    post.reactions[type].splice(idx, 1);
  } else {
    post.reactions[type].push(userId);
  }
  
  await post.save();
  
  // Return counts and user's reaction state
  const counts = {
    like: post.reactions.like?.length || 0,
    celebrate: post.reactions.celebrate?.length || 0,
    idea: post.reactions.idea?.length || 0
  };
  const userReactions = {
    like: post.reactions.like?.some(id => id.toString() === userIdStr) || false,
    celebrate: post.reactions.celebrate?.some(id => id.toString() === userIdStr) || false,
    idea: post.reactions.idea?.some(id => id.toString() === userIdStr) || false
  };
  
  res.json({ counts, userReactions });
});

export default router;

import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { trackCommentPosted, trackMentionReceived } from '../utils/statsService.js';

const router = express.Router();

// Get all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 }) // oldest first for chronological reading
      .lean();
    
    // Fetch all unique author IDs
    const authorIds = [...new Set(comments.map(c => c.authorId))];
    const users = await User.find({ _id: { $in: authorIds } }).select('_id name email role').lean();
    
    // Create a map for quick lookup
    const userMap = {};
    users.forEach(u => {
      userMap[u._id] = u;
    });
    
    // Attach user info to each comment
    const enrichedComments = comments.map(c => ({
      ...c,
      author: userMap[c.authorId] || { name: 'Unknown', role: 'Viewer' }
    }));
    
    res.json(enrichedComments);
  } catch (e) {
    console.error('Failed to fetch comments', e);
    res.status(500).json({ message: 'Unable to fetch comments' });
  }
});

// Create a new comment (authenticated users only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;
    
    if (!postId || !content) {
      return res.status(400).json({ message: 'postId and content are required' });
    }
    
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Extract mentions from content (e.g., @username)
    const mentionPattern = /@(\w+)/g;
    const mentionedUsernames = [];
    let match;
    
    while ((match = mentionPattern.exec(content)) !== null) {
      mentionedUsernames.push(match[1]);
    }
    
    // Find mentioned users by name or email
    const mentionedUsers = await User.find({
      $or: [
        { name: { $in: mentionedUsernames } },
        { email: { $in: mentionedUsernames.map(u => `${u}@`) } }
      ]
    }).select('_id');
    
    const mentions = mentionedUsers.map(u => u._id);
    
    // Create comment
    const comment = await Comment.create({
      postId,
      authorId: req.user.id,
      content: content.trim(),
      mentions,
      parentId: parentId || null
    });
    
    // Fetch author info
    const author = await User.findById(req.user.id).select('_id name email role').lean();
    
    // Track stats
    const { newBadges } = await trackCommentPosted(req.user.id, mentions.length);
    
    // Track mentions received
    for (const mentionedUserId of mentions) {
      await trackMentionReceived(mentionedUserId);
    }
    
    res.status(201).json({
      ...comment.toObject(),
      author,
      newBadges
    });
  } catch (e) {
    console.error('Failed to create comment', e);
    res.status(500).json({ message: 'Unable to create comment' });
  }
});

// Update a comment (only author can update)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author or admin
    if (String(comment.authorId) !== String(req.user.id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }
    
    if (content) {
      // Re-extract mentions
      const mentionPattern = /@(\w+)/g;
      const mentionedUsernames = [];
      let match;
      
      while ((match = mentionPattern.exec(content)) !== null) {
        mentionedUsernames.push(match[1]);
      }
      
      const mentionedUsers = await User.find({
        $or: [
          { name: { $in: mentionedUsernames } },
          { email: { $in: mentionedUsernames.map(u => `${u}@`) } }
        ]
      }).select('_id');
      
      comment.content = content.trim();
      comment.mentions = mentionedUsers.map(u => u._id);
      await comment.save();
    }
    
    const author = await User.findById(comment.authorId).select('_id name email role').lean();
    
    res.json({
      ...comment.toObject(),
      author
    });
  } catch (e) {
    console.error('Failed to update comment', e);
    res.status(500).json({ message: 'Unable to update comment' });
  }
});

// Delete a comment (only author or admin can delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author or admin
    if (String(comment.authorId) !== String(req.user.id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete the comment and any replies
    await Comment.deleteMany({ $or: [{ _id: id }, { parentId: id }] });
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (e) {
    console.error('Failed to delete comment', e);
    res.status(500).json({ message: 'Unable to delete comment' });
  }
});

// Get comment count for a post
router.get('/post/:postId/count', async (req, res) => {
  try {
    const { postId } = req.params;
    const count = await Comment.countDocuments({ postId });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: 'Unable to get comment count' });
  }
});

export default router;

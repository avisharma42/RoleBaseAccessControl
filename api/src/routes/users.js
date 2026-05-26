import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

import bcrypt from 'bcryptjs';

const router = express.Router();

// Get current user details
router.get('/me', requireAuth, async (req,res)=>{
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Update current user settings
router.put('/settings', requireAuth, async (req,res)=>{
  try {
    const { name, bio, avatar, preferences, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({message: 'User not found'});

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    if (newPassword && currentPassword) {
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return res.status(400).json({message: 'Incorrect current password'});
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    await user.save();
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch(e) {
    res.status(400).json({message: e.message});
  }
});

// Admin only below
router.get('/', requireAuth, requireRole(['Admin', 'Administrator']), async (req,res)=>{
  const users = await User.find().select('-password').sort({createdAt:-1});
  res.json(users);
});

router.patch('/:id', requireAuth, requireRole(['Admin', 'Administrator']), async (req,res)=>{
  const { role, active } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, active }, { new: true }).select('-password');
  res.json(user);
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req,res)=>{
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({email});
  if(exists) return res.status(400).json({message:'Email already in use'});
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role: role || 'Viewer' });
  res.json({ id: user._id, email: user.email });
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({message:'Invalid credentials'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({message:'Invalid credentials'});
  if(!user.active) return res.status(403).json({message:'Account disabled'});

  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true' });
  // Return token in body as well so clients that can't rely on cookies can send it in Authorization header
  res.json({ message:'Logged in', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/logout', (req,res)=>{
  res.clearCookie('token');
  res.json({ message:'Logged out' });
});

router.get('/me', requireAuth, async (req,res)=>{
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

export default router;

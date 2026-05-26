import express from 'express';
import Feedback from '../models/Feedback.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public: submit anonymous feedback
router.post('/', async (req, res) => {
  try{
    const { category, message } = req.body || {};
    if(!message || String(message).trim().length < 5) return res.status(400).json({ message: 'Message is too short' });
    const cat = ['Safety','System improvement','Complaint','Appreciation','Other'].includes(category) ? category : 'Other';
    const fb = new Feedback({ category: cat, message: String(message).trim() });
    await fb.save();
    return res.json({ ok:true });
  }catch(e){
    console.error('Feedback submit error', e);
    return res.status(500).json({ message: 'Unable to submit feedback' });
  }
});

// Admin: list feedbacks (paged simple)
router.get('/', requireAuth, requireRole(['Admin']), async (req, res) => {
  try{
    const items = await Feedback.find().sort({ createdAt: -1 }).lean();
    return res.json(items);
  }catch(e){
    console.error('Feedback list error', e);
    return res.status(500).json({ message: 'Unable to load feedback' });
  }
});

// Admin: resolve/unresolve
router.patch('/:id/resolve', requireAuth, requireRole(['Admin']), async (req, res) => {
  try{
    const id = req.params.id;
    const fb = await Feedback.findById(id);
    if(!fb) return res.status(404).json({ message: 'Not found' });
    fb.resolved = !!req.body.resolved;
    fb.resolvedBy = fb.resolved ? req.user.id : undefined;
    fb.resolvedAt = fb.resolved ? new Date() : undefined;
    await fb.save();
    return res.json({ ok:true });
  }catch(e){
    console.error('Feedback resolve error', e);
    return res.status(500).json({ message: 'Unable to update feedback' });
  }
});

export default router;

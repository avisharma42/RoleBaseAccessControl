import express from 'express';
import Role from '../models/Role.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req,res)=>{
  try {
    const roles = await Role.find().sort({createdAt:1});
    const rolesWithCount = await Promise.all(roles.map(async (r) => {
      const count = await User.countDocuments({ role: r.name });
      return { ...r.toObject(), usersCount: count };
    }));
    res.json(rolesWithCount);
  } catch(e) {
    res.status(500).json({message: e.message});
  }
});

// Admin only routes
router.use(requireRole(['Admin']));

router.post('/', async (req,res)=>{
  try {
    const role = await Role.create(req.body);
    res.json(role);
  } catch(e) {
    res.status(400).json({message: e.message});
  }
});

router.put('/:id', async (req,res)=>{
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json(role);
  } catch(e) {
    res.status(400).json({message: e.message});
  }
});

router.delete('/:id', async (req,res)=>{
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({message: "Role not found"});
    if (['Admin', 'Editor', 'Viewer'].includes(role.name)) {
      return res.status(400).json({message: "Cannot delete system roles"});
    }
    await Role.findByIdAndDelete(req.params.id);
    res.json({message: "Deleted"});
  } catch(e) {
    res.status(400).json({message: e.message});
  }
});

export default router;

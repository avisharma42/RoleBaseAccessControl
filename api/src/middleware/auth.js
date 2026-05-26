import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function requireAuth(req, res, next){
  // Support token from cookie OR Authorization: Bearer <token>
  const cookieToken = req.cookies?.token;
  const header = req.headers?.authorization || req.headers?.Authorization;
  let token = null;
  if(header && String(header).toLowerCase().startsWith('bearer ')){
    token = header.split(' ')[1];
  }
  if(!token) token = cookieToken;
  if(!token) return res.status(401).json({message:'Not authenticated'});
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch(e){
    return res.status(401).json({message:'Invalid token'});
  }
}

export function requireRole(roles){
  return async (req,res,next)=>{
    try{
      const user = await User.findById(req.user.id);
      if(!user || !user.active) return res.status(403).json({message:'Account disabled'});
      if(!roles.includes(user.role)) return res.status(403).json({message:'Insufficient role'});
      next();
    }catch(e){
      res.status(500).json({message:'Role check failed'});
    }
  }
}

export function ownsOrAdmin(getOwnerId){
  return async (req,res,next)=>{
    const userId = req.user.id;
    const isAdmin = req.user.role === 'Admin';
    if(isAdmin) return next();
    try{
      const ownerId = await getOwnerId(req);
      if(String(ownerId) === String(userId)) return next();
      return res.status(403).json({message:'Not owner'});
    }catch(e){
      return res.status(500).json({message:'Ownership check failed'});
    }
  }
}

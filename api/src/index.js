import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import feedbackRoutes from './routes/feedback.js';
import kudosRoutes from './routes/kudos.js';
import wellbeingRoutes from './routes/wellbeing.js';
import commentsRoutes from './routes/comments.js';
import gamificationRoutes from './routes/gamification.js';
import bookmarksRoutes from './routes/bookmarks.js';
import rolesRoutes from './routes/roles.js';
import Role from './models/Role.js';

const app = express();
const PORT = process.env.PORT || 4000;

const configuredOrigins = (process.env.WEB_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const isLocalDevOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, server-to-server, health checks).
    if (!origin) return callback(null, true);
    if (configuredOrigins.includes(origin) || isLocalDevOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/kudos', kudosRoutes);
app.use('/api/wellbeing', wellbeingRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/roles', rolesRoutes);

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  // Seed default roles if none exist
  const roleCount = await Role.countDocuments();
  if (roleCount === 0) {
    await Role.create([
      { name: 'Admin', description: 'Full access to all resources and settings.', permissions: { users: {read:true,create:true,update:true,delete:true}, roles: {read:true,create:true,update:true,delete:true}, content: {read:true,create:true,update:true,delete:true}, billing: {read:true,create:true,update:true,delete:true} } },
      { name: 'Editor', description: 'Can create and edit content, but cannot manage users.', permissions: { users: {read:true,create:false,update:false,delete:false}, roles: {read:false,create:false,update:false,delete:false}, content: {read:true,create:true,update:true,delete:false}, billing: {read:false,create:false,update:false,delete:false} } },
      { name: 'Viewer', description: 'Read-only access to available resources.', permissions: { users: {read:true,create:false,update:false,delete:false}, roles: {read:false,create:false,update:false,delete:false}, content: {read:true,create:false,update:false,delete:false}, billing: {read:false,create:false,update:false,delete:false} } }
    ]);
    console.log('Seeded default roles');
  }
  app.listen(PORT, () => console.log('API running on http://localhost:' + PORT));
}).catch(err => {
  console.error('Mongo connection error', err.message);
  process.exit(1);
});

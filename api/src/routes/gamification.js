import express from 'express';
import Achievement from '../models/Achievement.js';
import UserStats from '../models/UserStats.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { BADGES, calculateLevel, checkBadgeEarned, getNextBadge } from '../utils/gamification.js';

const router = express.Router();

// Get user stats and achievements
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user basic info
    const user = await User.findById(userId).select('name email role').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get or create user stats
    let stats = await UserStats.findOne({ userId }).lean();
    if (!stats) {
      stats = await UserStats.create({ userId });
    }
    
    // Get achievements
    const achievements = await Achievement.find({ userId }).sort({ earnedAt: -1 }).lean();
    
    // Calculate level
    const level = calculateLevel(stats.totalPoints);
    
    res.json({
      user,
      stats: { ...stats, level },
      achievements,
      badgeCount: achievements.length
    });
  } catch (e) {
    console.error('Failed to get user profile', e);
    res.status(500).json({ message: 'Unable to fetch profile' });
  }
});

// Get current user's stats (authenticated)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get or create user stats
    let stats = await UserStats.findOne({ userId }).lean();
    if (!stats) {
      stats = await UserStats.create({ userId });
    }
    
    // Get achievements
    const achievements = await Achievement.find({ userId }).sort({ earnedAt: -1 }).lean();
    
    // Calculate level and progress
    const level = calculateLevel(stats.totalPoints);
    const currentLevelThreshold = level > 1 ? [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000][level - 1] : 0;
    const nextLevelThreshold = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000][level] || 12000;
    const progress = ((stats.totalPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
    
    // Get next badges to unlock per category
    const categories = ['posts', 'kudos', 'comments', 'wellbeing', 'social'];
    const nextBadges = {};
    for (const cat of categories) {
      nextBadges[cat] = getNextBadge(cat, stats, achievements);
    }
    
    res.json({
      stats: { ...stats, level },
      achievements,
      badgeCount: achievements.length,
      levelProgress: Math.min(100, Math.max(0, progress)),
      nextLevelPoints: nextLevelThreshold,
      nextBadges
    });
  } catch (e) {
    console.error('Failed to get user stats', e);
    res.status(500).json({ message: 'Unable to fetch stats' });
  }
});

// Multiple leaderboards
router.get('/leaderboards', async (req, res) => {
  try {
    const { category = 'overall', period = 'all-time', limit = 10 } = req.query;
    
    let query = {};
    let sortField = 'totalPoints';
    
    // Determine sort field based on category
    switch (category) {
      case 'posts':
        sortField = 'postsCreated';
        break;
      case 'kudos-given':
        sortField = 'kudosGiven';
        break;
      case 'kudos-received':
        sortField = 'kudosReceived';
        break;
      case 'comments':
        sortField = 'commentsPosted';
        break;
      case 'wellbeing':
        sortField = 'wellbeingCheckIns';
        break;
      case 'streak':
        sortField = 'longestStreak';
        break;
      case 'social':
        sortField = 'mentionsGiven';
        break;
      case 'overall':
      default:
        sortField = 'totalPoints';
    }
    
    // Period filtering
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.lastActive = { $gte: weekAgo };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query.lastActive = { $gte: monthAgo };
    }
    
    // Get top users
    const leaderboard = await UserStats.find(query)
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Populate user info
    const userIds = leaderboard.map(s => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('_id name role').lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id] = u; });
    
    // Get achievement counts
    const achievementCounts = await Achievement.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const achievementMap = {};
    achievementCounts.forEach(a => { achievementMap[a._id] = a.count; });
    
    // Enrich leaderboard data
    const enriched = leaderboard.map((stat, index) => ({
      rank: index + 1,
      user: userMap[stat.userId] || { name: 'Unknown', role: 'Viewer' },
      value: stat[sortField],
      level: calculateLevel(stat.totalPoints),
      totalPoints: stat.totalPoints,
      badges: achievementMap[stat.userId] || 0,
      stats: {
        postsCreated: stat.postsCreated,
        kudosGiven: stat.kudosGiven,
        kudosReceived: stat.kudosReceived,
        commentsPosted: stat.commentsPosted,
        wellbeingCheckIns: stat.wellbeingCheckIns,
        currentStreak: stat.currentStreak,
        longestStreak: stat.longestStreak
      }
    }));
    
    res.json({
      category,
      period,
      leaderboard: enriched
    });
  } catch (e) {
    console.error('Failed to get leaderboard', e);
    res.status(500).json({ message: 'Unable to fetch leaderboard' });
  }
});

// Get all available badges
router.get('/badges', (req, res) => {
  const badges = Object.values(BADGES).map(b => ({
    id: b.id,
    name: b.name,
    icon: b.icon,
    description: b.description,
    category: b.category,
    points: b.points
  }));
  res.json(badges);
});

// Get badges by category
router.get('/badges/:category', (req, res) => {
  const { category } = req.params;
  const badges = Object.values(BADGES)
    .filter(b => b.category === category)
    .map(b => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      description: b.description,
      category: b.category,
      points: b.points
    }));
  res.json(badges);
});

// Award a special badge (Admin only)
router.post('/award-badge', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can award badges' });
    }
    
    const { userId, badgeId } = req.body;
    
    const badge = BADGES[badgeId.toUpperCase()];
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Check if already earned
    const existing = await Achievement.findOne({ userId, badgeId: badge.id });
    if (existing) {
      return res.status(400).json({ message: 'Badge already earned' });
    }
    
    // Award badge
    const achievement = await Achievement.create({
      userId,
      badgeId: badge.id,
      badgeName: badge.name,
      badgeCategory: badge.category,
      badgeIcon: badge.icon,
      badgeDescription: badge.description
    });
    
    // Update points
    const stats = await UserStats.findOne({ userId });
    if (stats) {
      stats.totalPoints += badge.points;
      stats.level = calculateLevel(stats.totalPoints);
      await stats.save();
    }
    
    res.json({ achievement, message: 'Badge awarded successfully' });
  } catch (e) {
    console.error('Failed to award badge', e);
    res.status(500).json({ message: 'Unable to award badge' });
  }
});

export default router;

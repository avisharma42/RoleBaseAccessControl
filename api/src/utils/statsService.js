import UserStats from '../models/UserStats.js';
import Achievement from '../models/Achievement.js';
import { BADGES, calculateLevel, checkBadgeEarned } from './gamification.js';

// Update user stats and check for new achievements
export async function updateStats(userId, updates) {
  try {
    // Get or create user stats
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }
    
    // Apply updates
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'number') {
        stats[key] = (stats[key] || 0) + value;
      } else {
        stats[key] = value;
      }
    }
    
    // Update last active
    stats.lastActive = new Date();
    
    // Check for new badges
    const earnedBadges = await Achievement.find({ userId }).select('badgeId').lean();
    const earnedIds = new Set(earnedBadges.map(b => b.badgeId));
    const newBadges = [];
    
    for (const badge of Object.values(BADGES)) {
      if (!earnedIds.has(badge.id) && checkBadgeEarned(badge, stats)) {
        // Award the badge
        const achievement = await Achievement.create({
          userId,
          badgeId: badge.id,
          badgeName: badge.name,
          badgeCategory: badge.category,
          badgeIcon: badge.icon,
          badgeDescription: badge.description
        });
        
        // Add points
        stats.totalPoints += badge.points;
        newBadges.push(achievement);
      }
    }
    
    // Update level
    stats.level = calculateLevel(stats.totalPoints);
    
    await stats.save();
    
    return { stats, newBadges };
  } catch (e) {
    console.error('Failed to update stats', e);
    return { stats: null, newBadges: [] };
  }
}

// Track post creation
export async function trackPostCreated(userId) {
  return updateStats(userId, { postsCreated: 1 });
}

// Track post deletion
export async function trackPostDeleted(userId) {
  return updateStats(userId, { postsDeleted: 1 });
}

// Track kudo given
export async function trackKudoGiven(userId) {
  return updateStats(userId, { kudosGiven: 1 });
}

// Track kudo received
export async function trackKudoReceived(userId) {
  return updateStats(userId, { kudosReceived: 1 });
}

// Track comment posted
export async function trackCommentPosted(userId, mentionCount = 0) {
  return updateStats(userId, { 
    commentsPosted: 1,
    mentionsGiven: mentionCount 
  });
}

// Track mention received
export async function trackMentionReceived(userId) {
  return updateStats(userId, { mentionsReceived: 1 });
}

// Track wellbeing check-in
export async function trackWellbeingCheckIn(userId) {
  const stats = await UserStats.findOne({ userId });
  
  if (!stats) {
    return updateStats(userId, { 
      wellbeingCheckIns: 1,
      currentStreak: 1,
      longestStreak: 1,
      lastCheckIn: new Date()
    });
  }
  
  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCheckIn = stats.lastCheckIn ? new Date(stats.lastCheckIn) : null;
  if (lastCheckIn) {
    lastCheckIn.setHours(0, 0, 0, 0);
  }
  
  let currentStreak = stats.currentStreak || 0;
  
  if (!lastCheckIn) {
    currentStreak = 1;
  } else {
    const daysDiff = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already checked in today, don't update
      return { stats, newBadges: [] };
    } else if (daysDiff === 1) {
      // Consecutive day
      currentStreak += 1;
    } else {
      // Streak broken
      currentStreak = 1;
    }
  }
  
  const longestStreak = Math.max(currentStreak, stats.longestStreak || 0);
  
  return updateStats(userId, {
    wellbeingCheckIns: 1,
    currentStreak,
    longestStreak,
    lastCheckIn: new Date()
  });
}

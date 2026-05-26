// Badge definitions with unlock criteria
export const BADGES = {
  // Posts Badges
  FIRST_POST: {
    id: 'first_post',
    name: 'First Steps',
    icon: '✍️',
    description: 'Created your first post',
    category: 'posts',
    criteria: { postsCreated: 1 },
    points: 10
  },
  PROLIFIC_WRITER: {
    id: 'prolific_writer',
    name: 'Prolific Writer',
    icon: '📝',
    description: 'Created 10 posts',
    category: 'posts',
    criteria: { postsCreated: 10 },
    points: 50
  },
  CONTENT_CREATOR: {
    id: 'content_creator',
    name: 'Content Creator',
    icon: '📰',
    description: 'Created 25 posts',
    category: 'posts',
    criteria: { postsCreated: 25 },
    points: 100
  },
  PUBLISHING_MASTER: {
    id: 'publishing_master',
    name: 'Publishing Master',
    icon: '🏆',
    description: 'Created 50 posts',
    category: 'posts',
    criteria: { postsCreated: 50 },
    points: 200
  },

  // Kudos Badges - Given
  FIRST_KUDO: {
    id: 'first_kudo',
    name: 'Appreciator',
    icon: '👍',
    description: 'Gave your first kudo',
    category: 'kudos',
    criteria: { kudosGiven: 1 },
    points: 5
  },
  GENEROUS_GIVER: {
    id: 'generous_giver',
    name: 'Generous Giver',
    icon: '💝',
    description: 'Gave 25 kudos',
    category: 'kudos',
    criteria: { kudosGiven: 25 },
    points: 75
  },
  KUDOS_CHAMPION: {
    id: 'kudos_champion',
    name: 'Kudos Champion',
    icon: '🌟',
    description: 'Gave 100 kudos',
    category: 'kudos',
    criteria: { kudosGiven: 100 },
    points: 150
  },

  // Kudos Badges - Received
  RISING_STAR: {
    id: 'rising_star',
    name: 'Rising Star',
    icon: '⭐',
    description: 'Received 10 kudos',
    category: 'kudos',
    criteria: { kudosReceived: 10 },
    points: 50
  },
  COMMUNITY_FAVORITE: {
    id: 'community_favorite',
    name: 'Community Favorite',
    icon: '💖',
    description: 'Received 50 kudos',
    category: 'kudos',
    criteria: { kudosReceived: 50 },
    points: 150
  },
  LEGENDARY: {
    id: 'legendary',
    name: 'Legendary',
    icon: '👑',
    description: 'Received 100 kudos',
    category: 'kudos',
    criteria: { kudosReceived: 100 },
    points: 300
  },

  // Comments Badges
  FIRST_COMMENT: {
    id: 'first_comment',
    name: 'Conversation Starter',
    icon: '💬',
    description: 'Posted your first comment',
    category: 'comments',
    criteria: { commentsPosted: 1 },
    points: 5
  },
  ACTIVE_COMMENTER: {
    id: 'active_commenter',
    name: 'Active Commenter',
    icon: '🗨️',
    description: 'Posted 50 comments',
    category: 'comments',
    criteria: { commentsPosted: 50 },
    points: 75
  },
  DISCUSSION_LEADER: {
    id: 'discussion_leader',
    name: 'Discussion Leader',
    icon: '💭',
    description: 'Posted 100 comments',
    category: 'comments',
    criteria: { commentsPosted: 100 },
    points: 150
  },

  // Wellbeing Badges
  MINDFUL_START: {
    id: 'mindful_start',
    name: 'Mindful Start',
    icon: '🧘',
    description: 'Completed your first wellbeing check-in',
    category: 'wellbeing',
    criteria: { wellbeingCheckIns: 1 },
    points: 10
  },
  WELLNESS_WARRIOR: {
    id: 'wellness_warrior',
    name: 'Wellness Warrior',
    icon: '💪',
    description: 'Completed 10 wellbeing check-ins',
    category: 'wellbeing',
    criteria: { wellbeingCheckIns: 10 },
    points: 50
  },
  STREAK_KEEPER: {
    id: 'streak_keeper',
    name: 'Streak Keeper',
    icon: '🔥',
    description: 'Maintained a 7-day wellbeing streak',
    category: 'wellbeing',
    criteria: { currentStreak: 7 },
    points: 100
  },
  CONSISTENCY_MASTER: {
    id: 'consistency_master',
    name: 'Consistency Master',
    icon: '🎯',
    description: 'Maintained a 30-day wellbeing streak',
    category: 'wellbeing',
    criteria: { currentStreak: 30 },
    points: 250
  },

  // Social Badges
  TEAM_PLAYER: {
    id: 'team_player',
    name: 'Team Player',
    icon: '🤝',
    description: 'Mentioned 10 different people',
    category: 'social',
    criteria: { mentionsGiven: 10 },
    points: 50
  },
  INFLUENCER: {
    id: 'influencer',
    name: 'Influencer',
    icon: '📢',
    description: 'Been mentioned 25 times',
    category: 'social',
    criteria: { mentionsReceived: 25 },
    points: 100
  },
  CONNECTOR: {
    id: 'connector',
    name: 'Connector',
    icon: '🌐',
    description: 'Active across all features (posts, kudos, comments)',
    category: 'social',
    criteria: { postsCreated: 5, kudosGiven: 10, commentsPosted: 10 },
    points: 150
  },

  // Special Badges
  EARLY_ADOPTER: {
    id: 'early_adopter',
    name: 'Early Adopter',
    icon: '🚀',
    description: 'One of the first users',
    category: 'special',
    criteria: { special: true },
    points: 100
  },
  FEEDBACK_HERO: {
    id: 'feedback_hero',
    name: 'Feedback Hero',
    icon: '📋',
    description: 'Submitted valuable feedback',
    category: 'special',
    criteria: { special: true },
    points: 50
  }
};

// Points required for each level
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5500,   // Level 8
  8000,   // Level 9
  12000   // Level 10
];

// Calculate user level based on points
export function calculateLevel(points) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

// Check if user has earned a badge
export function checkBadgeEarned(badge, userStats) {
  const criteria = badge.criteria;
  
  // Special badges are manually awarded
  if (criteria.special) return false;
  
  // Check all criteria
  for (const [key, value] of Object.entries(criteria)) {
    if (userStats[key] < value) {
      return false;
    }
  }
  
  return true;
}

// Get next badge to unlock in a category
export function getNextBadge(category, userStats, earnedBadges) {
  const categoryBadges = Object.values(BADGES)
    .filter(b => b.category === category)
    .sort((a, b) => {
      // Sort by first criteria value
      const aVal = Object.values(a.criteria)[0];
      const bVal = Object.values(b.criteria)[0];
      return aVal - bVal;
    });

  const earnedIds = earnedBadges.map(b => b.badgeId);
  
  for (const badge of categoryBadges) {
    if (!earnedIds.includes(badge.id)) {
      return badge;
    }
  }
  
  return null; // All badges earned
}

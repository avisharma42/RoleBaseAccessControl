import express from 'express';
import Wellbeing from '../models/Wellbeing.js';
import { requireAuth } from '../middleware/auth.js';
import { trackWellbeingCheckIn } from '../utils/statsService.js';

const router = express.Router();

// Record daily check-in
router.post('/', requireAuth, async (req, res) => {
  try {
    const { mood, journal } = req.body;
    const userId = req.user.id;

    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await Wellbeing.findOne({
      userId,
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existing) {
      // Update existing check-in
      existing.mood = mood;
      existing.journal = journal;
      await existing.save();
      return res.json(existing);
    }

    // Create new check-in
    const wellbeing = await Wellbeing.create({
      userId,
      mood,
      journal,
      timestamp: new Date()
    });

    // Track stats and check for achievements
    const { newBadges } = await trackWellbeingCheckIn(userId);

    res.json({ wellbeing, newBadges });
  } catch (e) {
    console.error('Wellbeing check-in error', e);
    res.status(500).json({ message: 'Unable to save wellbeing check-in' });
  }
});

// Get today's check-in
router.get('/today', requireAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const check = await Wellbeing.findOne({
      userId: req.user.id,
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    });

    res.json(check || null);
  } catch (e) {
    res.status(500).json({ message: 'Unable to get wellbeing check-in' });
  }
});

// Get encouraging messages based on mood
const ENCOURAGING_MESSAGES = {
  '😊': ["Great to see you so happy! Keep spreading the joy!", "Your positive energy is contagious!"],
  '🙂': ["You're doing well! Keep up the great work!", "Small steps lead to big achievements!"],
  '😐': ["Tomorrow is a new day with new opportunities!", "Take a moment to breathe and reset."],
  '☹️': ["It's okay to have off days. Be gentle with yourself.", "Remember: this too shall pass."],
  '😢': ["You're stronger than you think. Reach out if you need support.", "Take care of yourself today. You matter."]
};

const SUGGESTIONS = {
  '😊': ["Share your positivity with someone today!", "Document what made today great!"],
  '🙂': ["Take a short walk to keep the good mood going!", "Connect with a friend or colleague!"],
  '😐': ["Try a 5-minute mindfulness break.", "Listen to your favorite uplifting song."],
  '☹️': ["Step outside for fresh air and a change of scenery.", "Take a proper lunch break today."],
  '😢': ["Consider talking to someone you trust.", "Focus on small, manageable tasks today."]
};

// Get message and suggestion for a mood
router.get('/messages/:mood', async (req, res) => {
  const { mood } = req.params;
  if (!ENCOURAGING_MESSAGES[mood]) {
    return res.status(400).json({ message: 'Invalid mood' });
  }

  // Pick random message and suggestion
  const messages = ENCOURAGING_MESSAGES[mood];
  const suggestions = SUGGESTIONS[mood];
  const message = messages[Math.floor(Math.random() * messages.length)];
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

  res.json({ message, suggestion });
});

export default router;
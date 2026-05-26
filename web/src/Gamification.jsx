import React, { useState, useEffect } from 'react';
import { api } from './lib/api';

export default function Gamification({ user }) {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [levelProgress, setLevelProgress] = useState(0);
  const [nextBadges, setNextBadges] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory, selectedPeriod]);

  const loadData = async () => {
    try {
      const data = await api('/gamification/me');
      setStats(data.stats);
      setAchievements(data.achievements || []);
      setLevelProgress(data.levelProgress || 0);
      setNextBadges(data.nextBadges || {});
    } catch (e) {
      console.error('Failed to load gamification data', e);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await api(`/gamification/leaderboards?category=${selectedCategory}&period=${selectedPeriod}&limit=10`);
      setLeaderboard(data.leaderboard || []);
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    }
  };

  if (loading) {
    return <div className="p-6">Loading your achievements...</div>;
  }

  const categories = [
    { id: 'overall', name: '🏆 Overall', icon: '🏆' },
    { id: 'posts', name: '📝 Posts', icon: '📝' },
    { id: 'kudos-given', name: '💝 Kudos Given', icon: '💝' },
    { id: 'kudos-received', name: '⭐ Kudos Received', icon: '⭐' },
    { id: 'comments', name: '💬 Comments', icon: '💬' },
    { id: 'wellbeing', name: '🧘 Wellbeing', icon: '🧘' },
    { id: 'streak', name: '🔥 Streak', icon: '🔥' }
  ];

  const periods = [
    { id: 'all-time', name: 'All Time' },
    { id: 'monthly', name: 'This Month' },
    { id: 'weekly', name: 'This Week' }
  ];

  const getCategoryValue = (stat, category) => {
    switch (category) {
      case 'posts': return stat.stats.postsCreated;
      case 'kudos-given': return stat.stats.kudosGiven;
      case 'kudos-received': return stat.stats.kudosReceived;
      case 'comments': return stat.stats.commentsPosted;
      case 'wellbeing': return stat.stats.wellbeingCheckIns;
      case 'streak': return stat.stats.longestStreak;
      default: return stat.totalPoints;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level Card */}
        <div className="gamification-card level-card">
          <div className="card-header">
            <span className="card-icon">⬆️</span>
            <h3>Level {stats?.level || 1}</h3>
          </div>
          <div className="level-progress-container">
            <div className="level-progress-bar">
              <div 
                className="level-progress-fill" 
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="level-info">
              <span>{stats?.totalPoints || 0} pts</span>
              <span>{stats?.nextLevelPoints || 100} pts</span>
            </div>
          </div>
        </div>

        {/* Total Badges */}
        <div className="gamification-card badges-card">
          <div className="card-header">
            <span className="card-icon">🏅</span>
            <h3>Badges Earned</h3>
          </div>
          <div className="big-stat">{achievements.length}</div>
          <div className="stat-label">Total Achievements</div>
        </div>

        {/* Streak */}
        <div className="gamification-card streak-card">
          <div className="card-header">
            <span className="card-icon">🔥</span>
            <h3>Wellbeing Streak</h3>
          </div>
          <div className="big-stat">{stats?.currentStreak || 0} days</div>
          <div className="stat-label">Longest: {stats?.longestStreak || 0} days</div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-box">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats?.postsCreated || 0}</div>
          <div className="stat-name">Posts Created</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">💝</div>
          <div className="stat-value">{stats?.kudosGiven || 0}</div>
          <div className="stat-name">Kudos Given</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats?.kudosReceived || 0}</div>
          <div className="stat-name">Kudos Received</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">💬</div>
          <div className="stat-value">{stats?.commentsPosted || 0}</div>
          <div className="stat-name">Comments</div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🏅 Your Achievements</h2>
        {achievements.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No badges earned yet. Keep engaging!</p>
        ) : (
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div key={achievement._id} className="achievement-badge">
                <div className="badge-icon">{achievement.badgeIcon}</div>
                <div className="badge-name">{achievement.badgeName}</div>
                <div className="badge-description">{achievement.badgeDescription}</div>
                <div className="badge-date">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Badges to Unlock */}
      {Object.keys(nextBadges).length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Next Badges to Unlock</h2>
          <div className="next-badges-grid">
            {Object.entries(nextBadges).map(([category, badge]) => 
              badge && (
                <div key={badge.id} className="next-badge">
                  <div className="next-badge-icon">{badge.icon}</div>
                  <div className="next-badge-info">
                    <div className="next-badge-name">{badge.name}</div>
                    <div className="next-badge-desc">{badge.description}</div>
                    <div className="next-badge-category">{category}</div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Leaderboards */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🏆 Leaderboards</h2>
        
        {/* Category Selector */}
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`leaderboard-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Period Selector */}
        <div className="mb-4 flex gap-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`period-tab ${selectedPeriod === period.id ? 'active' : ''}`}
            >
              {period.name}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-table">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-3">Rank</th>
                <th className="text-left">User</th>
                <th className="text-left">Role</th>
                <th className="text-center">Level</th>
                <th className="text-center">Badges</th>
                <th className="text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr 
                  key={entry.user._id} 
                  className={`leaderboard-row ${entry.user._id === user?.id ? 'current-user' : ''}`}
                >
                  <td className="py-3">
                    <span className={`rank rank-${entry.rank}`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="font-medium">{entry.user.name}</td>
                  <td>
                    <span className="role-badge">{entry.user.role}</span>
                  </td>
                  <td className="text-center">
                    <span className="level-badge">Lv {entry.level}</span>
                  </td>
                  <td className="text-center">{entry.badges}</td>
                  <td className="text-right font-semibold">{getCategoryValue(entry, selectedCategory)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-slate-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

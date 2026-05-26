import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Avatar from './Avatar';

export default function UserProfileModal({ user, onClose }) {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Load gamification stats and achievements
      const profileData = await api(`/gamification/profile/${user.id || user._id}`);
      setStats(profileData.stats);
      setAchievements(profileData.achievements || []);
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={handleBackdropClick}>
      <div className="profile-modal-content">
        {/* Close button */}
        <button onClick={onClose} className="profile-modal-close" aria-label="Close profile">
          ✕
        </button>

        {/* Header with avatar and basic info */}
        <div className="profile-modal-header">
          <Avatar user={user} size="xl" className="profile-modal-avatar" />
          <div className="profile-modal-info">
            <h2 className="profile-modal-name">{user.name}</h2>
            <div className="profile-modal-meta">
              <span className="profile-modal-email">{user.email}</span>
              <span className={`profile-modal-role role-${user.role?.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Stats section */}
        {loading ? (
          <div className="profile-modal-loading">Loading stats...</div>
        ) : stats ? (
          <>
            <div className="profile-modal-section">
              <h3 className="profile-modal-section-title">Activity Stats</h3>
              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <div className="profile-stat-icon">📝</div>
                  <div className="profile-stat-value">{stats.postsCreated || 0}</div>
                  <div className="profile-stat-label">Posts</div>
                </div>
                <div className="profile-stat-card">
                  <div className="profile-stat-icon">👍</div>
                  <div className="profile-stat-value">{stats.kudosGiven || 0}</div>
                  <div className="profile-stat-label">Kudos Given</div>
                </div>
                <div className="profile-stat-card">
                  <div className="profile-stat-icon">🎉</div>
                  <div className="profile-stat-value">{stats.kudosReceived || 0}</div>
                  <div className="profile-stat-label">Kudos Received</div>
                </div>
                <div className="profile-stat-card">
                  <div className="profile-stat-icon">💬</div>
                  <div className="profile-stat-value">{stats.commentsPosted || 0}</div>
                  <div className="profile-stat-label">Comments</div>
                </div>
              </div>
            </div>

            {/* Level and points */}
            <div className="profile-modal-section">
              <h3 className="profile-modal-section-title">Level & Progress</h3>
              <div className="profile-level-card">
                <div className="profile-level-badge">
                  <div className="profile-level-number">{stats.level || 1}</div>
                  <div className="profile-level-label">Level</div>
                </div>
                <div className="profile-points">
                  <div className="profile-points-value">{stats.totalPoints || 0} points</div>
                  <div className="profile-points-bar">
                    <div 
                      className="profile-points-fill" 
                      style={{ width: `${Math.min(100, ((stats.totalPoints || 0) % 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">
                  Achievements ({achievements.length})
                </h3>
                <div className="profile-achievements-grid">
                  {achievements.slice(0, 6).map((ach, i) => (
                    <div key={i} className="profile-achievement-badge" title={ach.description}>
                      <div className="profile-achievement-icon">{ach.icon || '🏆'}</div>
                      <div className="profile-achievement-name">{ach.name}</div>
                    </div>
                  ))}
                </div>
                {achievements.length > 6 && (
                  <div className="profile-achievements-more">
                    +{achievements.length - 6} more
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="profile-modal-section">
            <p className="profile-modal-empty">No stats available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

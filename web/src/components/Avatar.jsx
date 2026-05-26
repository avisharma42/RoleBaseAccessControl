import React from 'react';

// 12 vibrant, distinct colors for avatars
const avatarColors = [
  '#667eea', // purple-blue
  '#764ba2', // deep purple  
  '#f093fb', // pink
  '#4facfe', // sky blue
  '#43e97b', // green
  '#fa709a', // rose
  '#fbbf24', // yellow
  '#30cfd0', // cyan
  '#a8edea', // mint
  '#ff9a9e', // coral
  '#fbc2eb', // lavender
  '#fddb92'  // gold
];

// Size variants
const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl'
};

// Extract initials from name
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Generate consistent color from user ID or email
function getAvatarColor(seed) {
  if (!seed) return avatarColors[0];
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}

export default function Avatar({ user, size = 'md', className = '', onClick }) {
  if (!user) {
    return (
      <div 
        className={`avatar-container ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: '#94a3b8' }}
      >
        <span className="avatar-text">?</span>
      </div>
    );
  }

  const initials = getInitials(user.name);
  const bgColor = getAvatarColor(user.id || user._id || user.email);

  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick(user);
    }
  };

  return (
    <div 
      className={`avatar-container ${sizeClasses[size]} ${className} ${onClick ? 'avatar-clickable' : ''}`}
      style={{ backgroundColor: user.avatar ? 'transparent' : bgColor, overflow: 'hidden' }}
      title={user.name}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); } : undefined}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span className="avatar-text">{initials}</span>
      )}
    </div>
  );
}

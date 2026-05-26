import React, { useEffect, useState, createContext, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { api, formatDateTime, giveKudo, getPostKudoCount, getCommentCount, toggleReaction, toggleBookmark, getBookmarks } from './lib/api';
import About from './About';
import Feedback from './Feedback';
import Kudos from './Kudos';
import Gamification from './Gamification';
import WellbeingCheck from './components/WellbeingCheck';
import CommentsSection from './components/CommentsSection';
import Avatar from './components/Avatar';
import UserProfileModal from './components/UserProfileModal';

// Redesigned UI Imports
import AppLayout from './components/layout/AppLayout';
import UserManagement from './pages/Users/UserManagement';
import RoleManagement from './pages/Roles/RoleManagement';
import PermissionManagement from './pages/Permissions/PermissionManagement';
import SystemHub from './pages/SystemHub/SystemHub';
import Settings from './pages/Settings/Settings';
import Button from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/Card';

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

export { useAuth };

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleGate({ allow = [], children }) {
  const { user } = useAuth();
  if (!user) return null;
  return allow.includes(user.role) ? children : <div className="p-6 text-sm text-red-600">You don't have permission.</div>;
}

function Layout({ children }) {
  const { user, logout, theme, setTheme, dark, toggleDark } = useAuth();
  const [surpriseOpen, setSurpriseOpen] = React.useState(false);
  const [surpriseItem, setSurpriseItem] = React.useState(null);

  const SURPRISE_BANK = [
    { title: "When code works on the first try", caption: "I swear I didn't touch it..." },
    { title: "Stack Overflow is my best friend", caption: "Friend: Do you even Google? Me: Google > me" },
    { title: "Debugging like a detective", caption: "Step 1: Blame the intern. Step 2: Blame the library. Step 3: Blame myself." },
    { title: "The commit message", caption: "Fixed stuff (promise)" },
    { title: "Production surprise", caption: "It worked locally... why not here?" },
    { title: "Unit tests", caption: "They passed once — we celebrate." },
    { title: "Rubber ducking", caption: "Explaining the problem out loud solved it. Thank you, rubber duck." },
    { title: "Refactor nostalgia", caption: "I refactored the code and now it looks like art." },
    { title: "Merge anxiety", caption: "Will CI pass? The suspense is real." },
    { title: "Synchronous dreams", caption: "Awaiting my dreams to resolve..." },
    { title: "The console.log fix", caption: "One console.log later: bug disappears mysteriously." },
    { title: "Version control", caption: "Commit early, commit often, panic later." },
    { title: "Keyboard shortcuts", caption: "Ctrl+C, Ctrl+V: the true power user combo." },
    { title: "Coffee loop", caption: "For loop? More like coffee loop." },
    { title: "Ship it", caption: "If it compiles and passes, it's production-ready. ™" },
    { title: "Pair programming", caption: "Two devs, one keyboard, infinite opinions." },
    { title: "The debugger", caption: "I love when the debugger tells me what I already knew." },
    { title: "Unexpected success", caption: "When you fix one bug and create three more." },
    { title: "Merge conflict workout", caption: "Cardio for coders: resolving conflicts." },
    { title: "Happy CI", caption: "CI passed on first try — celebrate responsibly." },
    { title: "The documentation", caption: "Here's how it works: it doesn't." },
    { title: "Legacy code", caption: "This file was written before the internet was invented." },
    { title: "Optimistic dev", caption: "I'll fix this later — famous last words." },
    { title: "Late night coding", caption: "Moonlight + coffee + one more bug." },
    { title: "Deploy ritual", caption: "Cross fingers, say a silent prayer, hit deploy." },
    { title: "Rubber stamp", caption: "PR approved: 'Looks good to me' — tm" },
    { title: "Feature flag", caption: "Toggle it on, see chaos, toggle it off." },
    { title: "The breakpoint", caption: "Adding breakpoints like seasoning — sprinkle liberally." },
    { title: "Snack-powered debugging", caption: "Cheetos + code = magic." },
    { title: "Celebrate tiny wins", caption: "Small progress is still progress — party time." }
  ];

  const openSurprise = () => {
    // pick a random index different from last shown (persist last in localStorage)
    let last = null;
    try { last = parseInt(localStorage.getItem('surprise_last')); } catch (e) { last = null; }
    let idx = Math.floor(Math.random() * SURPRISE_BANK.length);
    if (SURPRISE_BANK.length > 1) {
      // avoid immediate repeat
      let attempts = 0;
      while (idx === last && attempts < 8) { idx = Math.floor(Math.random() * SURPRISE_BANK.length); attempts++; }
    }
    const item = SURPRISE_BANK[idx];
    setSurpriseItem(item);
    try { localStorage.setItem('surprise_last', String(idx)); } catch (e) { }
    setSurpriseOpen(true);
  };

  // Keyboard shortcut: Shift+S opens Surprise (ignore when typing in inputs)
  React.useEffect(() => {
    const onKey = (e) => {
      // Check for Shift+S
      if (e.key && e.key.toLowerCase() === 's' && e.shiftKey) {
        try {
          const active = document.activeElement;
          const tag = active && active.tagName && active.tagName.toLowerCase();
          const isEditable = tag === 'input' || tag === 'textarea' || active?.isContentEditable;
          if (isEditable) return; // don't trigger while typing
        } catch (err) { }
        e.preventDefault();
        openSurprise();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // auto-close after a short while
  React.useEffect(() => {
    if (!surpriseOpen) return;
    const t = setTimeout(() => setSurpriseOpen(false), 6000);
    return () => clearTimeout(t);
  }, [surpriseOpen]);
  useEffect(() => {
    // attach animation behavior to any logoutButton elements
    const buttons = Array.from(document.querySelectorAll('.logoutButton'));
    if (!buttons.length) return;

    const logoutButtonStates = {
      'default': {
        '--figure-duration': '100',
        '--transform-figure': 'none',
        '--walking-duration': '100',
        '--transform-arm1': 'none',
        '--transform-wrist1': 'none',
        '--transform-arm2': 'none',
        '--transform-wrist2': 'none',
        '--transform-leg1': 'none',
        '--transform-calf1': 'none',
        '--transform-leg2': 'none',
        '--transform-calf2': 'none'
      },
      'hover': {
        '--figure-duration': '100',
        '--transform-figure': 'translateX(1.5px)',
        '--walking-duration': '100',
        '--transform-arm1': 'rotate(-5deg)',
        '--transform-wrist1': 'rotate(-15deg)',
        '--transform-arm2': 'rotate(5deg)',
        '--transform-wrist2': 'rotate(6deg)',
        '--transform-leg1': 'rotate(-10deg)',
        '--transform-calf1': 'rotate(5deg)',
        '--transform-leg2': 'rotate(20deg)',
        '--transform-calf2': 'rotate(-20deg)'
      },
      'walking1': {
        '--figure-duration': '300',
        '--transform-figure': 'translateX(11px)',
        '--walking-duration': '300',
        '--transform-arm1': 'translateX(-4px) translateY(-2px) rotate(120deg)',
        '--transform-wrist1': 'rotate(-5deg)',
        '--transform-arm2': 'translateX(4px) rotate(-110deg)',
        '--transform-wrist2': 'rotate(-5deg)',
        '--transform-leg1': 'translateX(-3px) rotate(80deg)',
        '--transform-calf1': 'rotate(-30deg)',
        '--transform-leg2': 'translateX(4px) rotate(-60deg)',
        '--transform-calf2': 'rotate(20deg)'
      },
      'walking2': {
        '--figure-duration': '400',
        '--transform-figure': 'translateX(17px)',
        '--walking-duration': '300',
        '--transform-arm1': 'rotate(60deg)',
        '--transform-wrist1': 'rotate(-15deg)',
        '--transform-arm2': 'rotate(-45deg)',
        '--transform-wrist2': 'rotate(6deg)',
        '--transform-leg1': 'rotate(-5deg)',
        '--transform-calf1': 'rotate(10deg)',
        '--transform-leg2': 'rotate(10deg)',
        '--transform-calf2': 'rotate(-20deg)'
      },
      'falling1': {
        '--figure-duration': '1600',
        '--walking-duration': '400',
        '--transform-arm1': 'rotate(-60deg)',
        '--transform-wrist1': 'none',
        '--transform-arm2': 'rotate(30deg)',
        '--transform-wrist2': 'rotate(120deg)',
        '--transform-leg1': 'rotate(-30deg)',
        '--transform-calf1': 'rotate(-20deg)',
        '--transform-leg2': 'rotate(20deg)'
      },
      'falling2': {
        '--walking-duration': '300',
        '--transform-arm1': 'rotate(-100deg)',
        '--transform-arm2': 'rotate(-60deg)',
        '--transform-wrist2': 'rotate(60deg)',
        '--transform-leg1': 'rotate(80deg)',
        '--transform-calf1': 'rotate(20deg)',
        '--transform-leg2': 'rotate(-60deg)'
      },
      'falling3': {
        '--walking-duration': '500',
        '--transform-arm1': 'rotate(-30deg)',
        '--transform-wrist1': 'rotate(40deg)',
        '--transform-arm2': 'rotate(50deg)',
        '--transform-wrist2': 'none',
        '--transform-leg1': 'rotate(-30deg)',
        '--transform-leg2': 'rotate(20deg)',
        '--transform-calf2': 'none'
      }
    };

    const listeners = [];

    buttons.forEach(button => {
      button.state = 'default';

      const updateButtonState = (btn, state) => {
        if (logoutButtonStates[state]) {
          btn.state = state;
          for (let key in logoutButtonStates[state]) {
            btn.style.setProperty(key, logoutButtonStates[state][key]);
          }
        }
      };

      const onMouseEnter = () => { if (button.state === 'default') updateButtonState(button, 'hover'); };
      const onMouseLeave = () => { if (button.state === 'hover') updateButtonState(button, 'default'); };

      const onClick = () => {
        if (button.state === 'default' || button.state === 'hover') {
          button.classList.add('clicked');
          updateButtonState(button, 'walking1');
          const t1 = setTimeout(() => {
            button.classList.add('door-slammed');
            updateButtonState(button, 'walking2');
            const t2 = setTimeout(() => {
              button.classList.add('falling');
              updateButtonState(button, 'falling1');
              const t3 = setTimeout(() => {
                updateButtonState(button, 'falling2');
                const t4 = setTimeout(() => {
                  updateButtonState(button, 'falling3');
                  const t5 = setTimeout(() => {
                    button.classList.remove('clicked');
                    button.classList.remove('door-slammed');
                    button.classList.remove('falling');
                    updateButtonState(button, 'default');
                    // call logout after animation finishes
                    try { logout(); } catch (e) { }
                  }, 1000);
                  listeners.push(t5);
                }, parseInt(logoutButtonStates['falling2']['--walking-duration']));
                listeners.push(t4);
              }, parseInt(logoutButtonStates['falling1']['--walking-duration']));
              listeners.push(t3);
            }, parseInt(logoutButtonStates['walking2']['--figure-duration']));
            listeners.push(t2);
          }, parseInt(logoutButtonStates['walking1']['--figure-duration']));
          listeners.push(t1);
        }
      };

      button.addEventListener('mouseenter', onMouseEnter);
      button.addEventListener('mouseleave', onMouseLeave);
      button.addEventListener('click', onClick);

      listeners.push(() => { button.removeEventListener('mouseenter', onMouseEnter); button.removeEventListener('mouseleave', onMouseLeave); button.removeEventListener('click', onClick); });
    });

    return () => {
      // cleanup listeners and timers
      listeners.forEach(l => { try { if (typeof l === 'function') l(); else clearTimeout(l); } catch (e) { } });
    };
  }, [logout]);
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-white border-r">
        <div className="p-4 font-bold">RBAC Dashboard</div>
        <nav className="p-2 space-y-1">
          <Link className="block px-3 py-2 hover:bg-slate-100 rounded" to="/">Overview</Link>
          <Link className="block px-3 py-2 hover:bg-slate-100 rounded" to="/posts">Posts</Link>
          <Link className="block px-3 py-2 hover:bg-slate-100 rounded" to="/users">Users</Link>
          <Link className="block px-3 py-2 hover:bg-slate-100 rounded" to="/gamification">🏆 Achievements</Link>
          <Link className="block px-3 py-2 hover:bg-slate-100 rounded" to="/about">Help / About</Link>
          <Link className="block px-3 py-2 hover:bg-slate-100 rounded" to="/feedback">Feedback</Link>
          <Link className="block px-3 py-2 hover:bg-slate-100 rounded" to="/kudos">Kudos</Link>
        </nav>
      </aside>
      <main className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-xl font-semibold">Welcome, {user?.name}</div>
            <span className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">{user?.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="theme-select">Theme</label>
            <select id="theme-select" value={theme} onChange={e => setTheme(e.target.value)} className="text-sm px-3 py-1 bg-slate-200 rounded">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="blue">Blue</option>
              <option value="forest">Forest</option>
              <option value="neon">Neon</option>
              <option value="minimal">Minimal</option>
            </select>
            {/* subtle surprise button (small, slightly hidden) */}
            <button title="Surprise" onClick={openSurprise} className="surprise-btn" aria-label="Surprise">🎉 Surprise</button>
            {/* Animated logout button (replaces the simple Logout button) */}
            <button type="button" className="logoutButton" aria-label="Log out" title="Log out">
              <span className="button-text">Log Out</span>
              <svg className="figure" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            </button>
            {/* minimal styles for the animated button (kept in-file to avoid touching other files) */}
            <style>{`\
              .logoutButton { 
                display: inline-flex; 
                align-items: center; 
                gap: 8px; 
                padding: 8px 16px; 
                border-radius: 6px; 
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
                cursor: pointer;
                /* Light theme */
                background: #fff;
                color: #000;
                border: 1px solid #e5e7eb;
              }
              /* Dark theme */
              .dark .logoutButton {
                background: #1f2937;
                color: #fff;
                border-color: #374151;
              }
              .logoutButton:hover {
                background: #f3f4f6;
              }
              .dark .logoutButton:hover {
                background: #374151;
              }
              .logoutButton:active {
                transform: scale(0.98);
              }
              .logoutButton svg {
                opacity: 0.7;
              }
              .logoutButton:hover svg {
                opacity: 1;
              }
            `}</style>
          </div>
        </div>
        {children}
        {/* Surprise / single meme overlay */}
        {surpriseOpen && surpriseItem && (
          <div className="surprise-overlay" role="dialog" aria-modal="true" onClick={() => setSurpriseOpen(false)}>
            <div className="surprise-backdrop" />
            <div className="surprise-panel" onClick={e => e.stopPropagation()}>
              <div className="quote">{surpriseItem.title}</div>
              <div className="text-sm text-slate-500 mt-2">{surpriseItem.caption}</div>
              <div className="mt-4">
                <button onClick={() => setSurpriseOpen(false)} className="close px-3 py-2 bg-slate-200 rounded">Close</button>
              </div>
            </div>
            {/* confetti pieces */}
            {Array.from({ length: 18 }).map((_, i) => {
              const left = Math.random() * 100;
              const bg = ['#ff6b6b', '#ffd166', '#6bf178', '#6bd3ff', '#b28bff'][i % 5];
              const delay = Math.random() * 600;
              const style = { left: `${left}%`, background: bg, animationDelay: `${delay}ms`, transform: `rotate(${Math.floor(Math.random() * 360)}deg)` };
              return <div key={i} className="confetti" style={style} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Define role capabilities for the UI
const ROLE_INFO = {
  Admin: {
    icon: '👑',
    description: 'Full system access',
    capabilities: [
      'Create new posts',
      'Delete any post',
      'Manage all users',
      'Change user roles',
      'View all content'
    ]
  },
  Editor: {
    icon: '✍️',
    description: 'Content management',
    capabilities: [
      'Create new posts',
      'Delete your own posts',
      'View all content'
    ]
  },
  Viewer: {
    icon: '👀',
    description: 'Read-only access',
    capabilities: [
      'View all posts',
      'Use post filters',
      'Read comments'
    ]
  }
};

function AuditTrail() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Simulated audit logs for visual presentation
    // In a real app, this would be fetched from an API endpoint
    const mockLogs = [
      { id: 1, time: new Date(Date.now() - 1000 * 60 * 5), action: 'Role permissions updated', user: 'Admin' },
      { id: 2, time: new Date(Date.now() - 1000 * 60 * 30), action: 'New user invited', user: 'Admin' },
      { id: 3, time: new Date(Date.now() - 1000 * 60 * 60 * 2), action: 'Post "System Update" deleted', user: 'Editor' },
      { id: 4, time: new Date(Date.now() - 1000 * 60 * 60 * 5), action: 'Security settings changed', user: 'Admin' },
    ];
    setLogs(mockLogs);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900">Audit Trail</h3>
        <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-500 rounded font-medium">Live</span>
      </div>
      <div className="space-y-4 flex-1">
        {logs.map((log, index) => (
          <div key={log.id} className="flex gap-3 relative">
            {/* Timeline line */}
            {index !== logs.length - 1 && (
              <div className="absolute top-6 left-[11px] bottom-[-16px] w-[2px] bg-zinc-100"></div>
            )}
            {/* Timeline dot */}
            <div className="w-6 h-6 rounded-full bg-zinc-50 border-2 border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-900 truncate">{log.action}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-zinc-500 bg-zinc-50 px-1 rounded">[{formatTime(log.time)}]</span>
                <span className="text-xs text-zinc-400">by {log.user}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
        View All Logs
      </button>
    </div>
  );
}

function Dashboard() {
  const { user, openProfile } = useAuth();
  const [stats, setStats] = useState({ posts: 0, users: 0, roles: 0 });
  const roleInfo = ROLE_INFO[user?.role] || { capabilities: [] };

  useEffect(() => {
    (async () => {
      try {
        const [postsRes, usersRes, rolesRes] = await Promise.all([
          api('/posts'),
          api('/users'),
          api('/roles')
        ]);
        setStats({ posts: postsRes.length, users: usersRes.length, roles: rolesRes.length });
      } catch (e) { }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome / Role Capabilities Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl" role="img" aria-label={`${user?.role} role icon`}>{roleInfo.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Welcome back, {user?.name}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Here's what you can do as {user?.role}: {roleInfo.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {roleInfo.capabilities.map((cap, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col justify-center items-center text-center">
               <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Total Posts</div>
               <div className="text-3xl font-bold text-zinc-900">{stats.posts}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col justify-center items-center text-center">
               <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Active Users</div>
               <div className="text-3xl font-bold text-zinc-900">{stats.users}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col justify-center items-center text-center">
               <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">System Roles</div>
               <div className="text-3xl font-bold text-zinc-900">{stats.roles}</div>
            </div>
          </div>

          {/* Activity Graph */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
            <div className="text-base font-semibold text-zinc-900 mb-6">Activity Overview</div>
            <div className="h-80">
              <ActivityGraph />
            </div>
          </div>

        </div>

        {/* Right Column (Spans 1) */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>
            
            <div className="relative mb-4">
              <Avatar user={user} size="xl" className="ring-4 ring-white shadow-md rounded-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => openProfile && openProfile(user)} />
            </div>
            
            <div className="w-full mb-6">
              <h3 className="text-xl font-bold text-zinc-900 truncate">{user?.name || 'Loading...'}</h3>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${user?.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 
                    user?.role === 'Editor' ? 'bg-emerald-100 text-emerald-800' : 
                    'bg-amber-100 text-amber-800'}`}>
                  {user?.role || 'User'}
                </span>
              </div>
            </div>

            <div className="w-full space-y-3 mb-6 text-sm text-zinc-600">
              <div className="flex flex-col items-center justify-between py-2 border-b border-zinc-50">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Email Address</span>
                <span className="font-medium truncate max-w-[200px]">{user?.email || '—'}</span>
              </div>
              <div className="flex flex-col items-center justify-between py-2">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Last Login</span>
                <span className="font-medium">Just now</span>
              </div>
            </div>

            <Link to="/settings" className="w-full mt-auto">
              <Button variant="secondary" className="w-full justify-center">Edit Profile</Button>
            </Link>
          </div>

          {/* Wellbeing Check Card */}
          <WellbeingCheck />

          {/* Audit Trail (Mini Log) */}
          <AuditTrail />

        </div>

      </div>
    </div>
  );
}

// Professional Activity Graph component
function ActivityGraph() {
  // Generate sample 14-day data
  const data = React.useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      
      arr.push({
        time: dateStr,
        fullDate: fullDate,
        post: Math.floor(Math.random() * 40) + 10,
        user: Math.floor(Math.random() * 20) + 5,
        deletion: Math.floor(Math.random() * 5),
      });
    }
    return arr;
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const fullDate = payload[0].payload.fullDate;
      return (
        <div className="bg-white border border-zinc-200 shadow-lg rounded-lg p-3 text-sm">
          <p className="font-semibold text-zinc-800 mb-2 border-b pb-1">{fullDate}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-zinc-600 capitalize">{entry.name}</span>
              </div>
              <span className="font-medium text-zinc-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            name="Post Actions"
            type="monotone" 
            dataKey="post" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            name="User Actions"
            type="monotone" 
            dataKey="user" 
            stroke="#22c55e" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            name="Critical / Deletions"
            type="monotone" 
            dataKey="deletion" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Small Kudo button component: shows count and allows toggling kudos for a post
function KudoButton({ postId, authorId }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasGiven, setHasGiven] = useState(false);
  const [error, setError] = useState('');

  // Check initial kudo state when component mounts
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPostKudoCount(postId);
        if (mounted) {
          setCount((res && typeof res.count === 'number') ? res.count : 0);
          // Server tells us if we've already given a kudo
          setHasGiven(res.hasGiven || false);
        }
      } catch (e) {
        console.debug('Kudo count fetch failed', e);
      }
    })();
    return () => mounted = false;
  }, [postId]);

  const toggleKudo = async () => {
    if (!user) return alert('Please sign in to give kudos');
    if (String(user.id) === String(authorId)) {
      // Prevent self-kudos on client
      return alert('You cannot give kudos to your own post');
    }
    setLoading(true);
    setError('');
    try {
      const res = await giveKudo(postId);
      if (res.ok) {
        setCount(res.count);
        setHasGiven(!hasGiven); // Toggle state based on action
      }
    } catch (e) {
      const msg = (e && e.message) ? e.message : 'Unable to update kudo';
      setError(msg);
    } finally { setLoading(false); }
  };

  const disabled = loading || hasGiven || String(user?.id) === String(authorId);
  const title = String(user?.id) === String(authorId) ? 'Cannot kudo your own post'
    : hasGiven ? 'Already gave a kudo'
      : 'Give a kudo';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`text-sm ${hasGiven ? 'text-pink-500 dark:text-pink-400' : 'text-slate-500'}`}>
        {count}
        <span aria-hidden className={`ml-1 inline-block transition-transform ${hasGiven ? 'scale-110' : ''}`}>
          {hasGiven ? '❤️' : '🤍'}
        </span>
      </div>
      <button
        onClick={toggleKudo}
        disabled={loading}
        title={title}
        className={`
          px-3 py-1.5 text-xs font-medium rounded-md 
          transition-all duration-200 transform hover:scale-105 active:scale-95
          border shadow-sm
          ${hasGiven ?
            'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-pink-500' :
            'bg-white text-pink-600 border-pink-200 hover:bg-pink-50'
          }
          dark:border-slate-600
          ${loading ? 'opacity-75' : ''}
        `}
      >
        {loading ? 'Sending...' : hasGiven ? 'Kudoed!' : 'Give Kudo'}
      </button>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}

function Posts() {
  const { user, openProfile } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [postReactions, setPostReactions] = useState({}); // { postId: { counts, userReactions } }
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [usersMap, setUsersMap] = useState({}); // { userId: user object }
  
  const [editingPostId, setEditingPostId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', body: '', tags: [] });

  const [confirm, setConfirm] = useState({ open: false, id: null, title: '' });

  const load = async () => {
    setLoadingPosts(true);
    try {
      const data = await api('/posts');
      setList(data);

      // Load comment counts and reactions for all posts
      const counts = {};
      const reactions = {};
      await Promise.all(data.map(async (post) => {
        try {
          const result = await getCommentCount(post._id);
          counts[post._id] = result.count;
        } catch (e) {
          counts[post._id] = 0;
        }

        // Initialize reaction state from post data
        const rCounts = {
          like: post.reactions?.like?.length || 0,
          celebrate: post.reactions?.celebrate?.length || 0,
          idea: post.reactions?.idea?.length || 0
        };
        const userReacted = {
          like: post.reactions?.like?.includes(user.id) || false,
          celebrate: post.reactions?.celebrate?.includes(user.id) || false,
          idea: post.reactions?.idea?.includes(user.id) || false
        };
        reactions[post._id] = { counts: rCounts, userReactions: userReacted };
      }));
      setCommentCounts(counts);
      setPostReactions(reactions);

      // Load user bookmarks
      const bookmarks = await getBookmarks();
      setBookmarkedPosts(new Set(bookmarks.map(p => p._id)));

      // Load all users for author avatars
      const users = await api('/users');
      const userMap = {};
      users.forEach(u => { userMap[u._id] = u; });
      setUsersMap(userMap);
    } catch (e) { }
    setLoadingPosts(false);
  };

  useEffect(() => { load(); }, []);

  const toggleComments = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  // compute available tags when list changes
  useEffect(() => {
    const set = new Set();
    list.forEach(p => { (p.tags || []).forEach(t => set.add(t)); });
    setAvailableTags(Array.from(set).sort());
  }, [list]);

  const createPost = async (e) => {
    e.preventDefault();
    await api('/posts', { method: 'POST', body: JSON.stringify(form) });
    setForm({ title: '', body: '', tags: [] });
    load();
  };

  const addTagToForm = (t) => {
    const tag = String(t || tagInput).trim();
    if (!tag) return;
    if ((form.tags || []).includes(tag)) { setTagInput(''); return; }
    setForm(f => ({ ...f, tags: [...(f.tags || []), tag] }));
    setTagInput('');
  };
  const removeTagFromForm = (t) => setForm(f => ({ ...f, tags: (f.tags || []).filter(x => x !== t) }));

  // Handle reactions
  const handleReaction = async (postId, type) => {
    try {
      const result = await toggleReaction(postId, type);
      setPostReactions(prev => ({
        ...prev,
        [postId]: result
      }));
    } catch (e) {
      console.error('Failed to toggle reaction', e);
    }
  };

  // Handle bookmarks
  const handleBookmark = async (postId) => {
    try {
      const result = await toggleBookmark(postId);
      setBookmarkedPosts(prev => {
        const newSet = new Set(prev);
        if (result.bookmarked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    }
  };

  // Render hashtags as clickable
  const renderWithHashtags = (text) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.match(/^#\w+$/)) {
        const tag = part.slice(1).toLowerCase();
        return (
          <span
            key={i}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
            onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // filter helpers
  let visiblePosts = selectedTag ? list.filter(p => (p.tags || []).includes(selectedTag)) : list;
  if (showBookmarksOnly) {
    visiblePosts = visiblePosts.filter(p => bookmarkedPosts.has(p._id));
  }

  // open confirm dialog (shows 3D, animated modal)
  const askDelete = (id, title = 'this item') => {
    setConfirm({ open: true, id, title });
  };

  // actually perform delete (called when user confirms)
  const doDelete = async () => {
    if (!confirm.id) return;
    try {
      await api('/posts/' + confirm.id, { method: 'DELETE' });
    } catch (e) { }
    setConfirm({ open: false, id: null, title: '' });
    load();
  };

  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditForm({ title: post.title, body: post.body, tags: post.tags || [] });
  };

  const saveEdit = async () => {
    if (!editingPostId) return;
    try {
      await api(`/posts/${editingPostId}`, { method: 'PUT', body: JSON.stringify(editForm) });
      setEditingPostId(null);
      load();
    } catch (e) {
      console.error('Failed to update post', e);
    }
  };

  const cancelDelete = () => setConfirm({ open: false, id: null, title: '' });

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">All Posts</div>
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`text-xs px-3 py-1 rounded transition-colors ${showBookmarksOnly ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {showBookmarksOnly ? '📚 Showing Saved' : '🔖 Show Saved'}
          </button>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-slate-500">{loadingPosts ? 'Loading...' : `${visiblePosts.length} posts`}</div>
          <div className="flex gap-2 items-center">
            <span className={`tag-filter ${selectedTag === null ? 'active' : ''}`} onClick={() => setSelectedTag(null)}>All</span>
            {availableTags.map(t => (
              <button key={t} onClick={() => setSelectedTag(t)} className={`tag-filter ${selectedTag === t ? 'active' : ''}`}>#{t}</button>
            ))}
          </div>
        </div>
        <ul className="space-y-2">
          {visiblePosts.map(p => {
            const author = usersMap[p.authorId] || { name: 'Unknown', id: p.authorId };
            return (
              <li key={p._id} className="border rounded p-3 bg-white">
                <div className="flex items-start gap-3">
                  <Avatar user={author} size="md" onClick={openProfile} />
                  {editingPostId === p._id ? (
                    <div className="flex-1 min-w-0 space-y-2">
                      <input className="w-full border rounded px-3 py-2 text-sm font-medium" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      <textarea className="w-full border rounded px-3 py-2 text-sm resize-none" rows={3} value={editForm.body} onChange={e => setEditForm({...editForm, body: e.target.value})} />
                      <div className="flex gap-2 mt-2">
                        <button onClick={saveEdit} className="text-xs px-3 py-1.5 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors">Save Changes</button>
                        <button onClick={() => setEditingPostId(null)} className="text-xs px-3 py-1.5 bg-slate-200 text-slate-700 font-medium rounded hover:bg-slate-300 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{p.title}</div>
                          <span className="text-xs text-slate-500">by {author.name}</span>
                        </div>
                        <time className="timestamp shrink-0" dateTime={p.createdAt}>{formatDateTime(p.createdAt)}</time>
                      </div>
                      <div className="text-sm text-slate-600">{renderWithHashtags(p.body)}</div>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {(p.tags || []).map(t => (
                          <span
                            key={t}
                            className="tag-chip small cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedTag(t)}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Reactions bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReaction(p._id, 'like')}
                            className={`reaction-btn ${postReactions[p._id]?.userReactions.like ? 'reacted' : ''}`}
                            title="Like"
                          >
                            👍 <span className="count">{postReactions[p._id]?.counts.like || 0}</span>
                          </button>
                          <button
                            onClick={() => handleReaction(p._id, 'celebrate')}
                            className={`reaction-btn ${postReactions[p._id]?.userReactions.celebrate ? 'reacted' : ''}`}
                            title="Celebrate"
                          >
                            🎉 <span className="count">{postReactions[p._id]?.counts.celebrate || 0}</span>
                          </button>
                          <button
                            onClick={() => handleReaction(p._id, 'idea')}
                            className={`reaction-btn ${postReactions[p._id]?.userReactions.idea ? 'reacted' : ''}`}
                            title="Idea"
                          >
                            💡 <span className="count">{postReactions[p._id]?.counts.idea || 0}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => toggleComments(p._id)}
                          className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          💬 {expandedPost === p._id ? 'Hide' : 'Show'} ({commentCounts[p._id] || 0})
                        </button>

                        <button
                          onClick={() => handleBookmark(p._id)}
                          className={`bookmark-btn ${bookmarkedPosts.has(p._id) ? 'bookmarked' : ''}`}
                          title={bookmarkedPosts.has(p._id) ? 'Remove bookmark' : 'Save post'}
                        >
                          {bookmarkedPosts.has(p._id) ? '🔖' : '📑'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {/* Kudo count and action */}
                    <KudoButton postId={p._id} authorId={p.authorId} />
                    {(user.role === 'Admin' || user.role === 'Editor') && editingPostId !== p._id && (
                      <button onClick={() => startEdit(p)} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 font-medium rounded hover:bg-indigo-200 transition-colors w-full text-center mt-1">Edit</button>
                    )}
                    {(user.role === 'Admin' || String(p.authorId) === user.id) && editingPostId !== p._id && (
                      <button onClick={() => askDelete(p._id, p.title)} className="text-xs px-2 py-1 bg-red-100 text-red-700 font-medium rounded hover:bg-red-200 transition-colors w-full text-center">Delete</button>
                    )}
                  </div>
                </div>
                {expandedPost === p._id && (
                  <div className="mt-4 pt-4 border-t ml-14">
                    <CommentsSection postId={p._id} user={user} openProfile={openProfile} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <RoleGate allow={['Admin', 'Editor']}>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold mb-2">Create Post</div>
          <form onSubmit={createPost} className="space-y-2">
            <input className="w-full border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div className="relative">
              <textarea
                className="w-full border rounded px-3 py-2 resize-none"
                placeholder="Body"
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                maxLength={500}
                rows={4}
              />
              <div className={`character-count ${form.body.length > 400 ? 'near-limit' : ''} ${form.body.length > 450 ? 'very-near-limit' : ''}`}>
                <div className="count-text">{form.body.length}</div>
                <div className="count-bar">
                  <div
                    className="count-progress"
                    style={{ width: `${Math.min(100, (form.body.length / 500) * 100)}%` }}
                  />
                </div>
                <div className="count-label">/500</div>
              </div>
            </div>
            <button className="px-3 py-2 bg-black text-white rounded">Save</button>
          </form>
        </div>
      </RoleGate>

      {/* Confirmation modal (3D / eye-catching) */}
      {confirm.open && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="confirm-modal">
            <div className="confirm-3d-ring" aria-hidden="true"></div>
            <div className="confirm-content">
              <h3 className="text-lg font-semibold">Are you sure?</h3>
              <p className="text-sm text-slate-500 mt-2">Do you really want to delete <span className="font-medium">"{confirm.title}"</span>? This action cannot be undone.</p>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={cancelDelete} className="px-3 py-2 rounded bg-slate-200 text-slate-800">Cancel</button>
                <button onClick={doDelete} className="px-4 py-2 rounded bg-red-600 text-white shadow-3d">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Viewer' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Role-based email domain mapping
  const roleDomains = {
    'Admin': 'admin.com',
    'Editor': 'editor.com',
    'Viewer': 'viewer.com'
  };

  const validateEmail = (email, role) => {
    const domain = roleDomains[role];
    return email.endsWith(`@${domain}`);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Validate password match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    // Validate email domain based on role
    if (!validateEmail(form.email, form.role)) {
      setError(`Email must be from @${roleDomains[form.role]} domain for ${form.role} role`);
      setSubmitting(false);
      return;
    }

    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        })
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => nav('/login'), 2000);
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const roleInfo = {
    'Admin': { icon: '👑', color: 'from-indigo-500 to-indigo-600', domain: roleDomains.Admin },
    'Editor': { icon: '✏️', color: 'from-blue-500 to-blue-600', domain: roleDomains.Editor },
    'Viewer': { icon: '👁️', color: 'from-emerald-500 to-emerald-600', domain: roleDomains.Viewer }
  };

  const currentRoleInfo = roleInfo[form.role];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-500 font-bold text-3xl mb-6">
          RBAC Pro
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Create Account</CardTitle>
            <CardDescription className="text-center mt-2">Join our RBAC platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Select Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(roleInfo).map(([role, info]) => (
                    <div
                      key={role}
                      onClick={() => setForm({ ...form, role, email: '' })}
                      className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center transition-all ${form.role === role ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-600' : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${info.color} text-white mb-2 shadow-sm`}>
                        {info.icon}
                      </div>
                      <span className={`text-sm font-medium ${form.role === role ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{role}</span>
                      <span className="text-[10px] text-zinc-500 mt-1">@{info.domain}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email (@{currentRoleInfo.domain})</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                {form.email && !validateEmail(form.email, form.role) && (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">Must end with @{currentRoleInfo.domain}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">Passwords don't match</p>
                )}
              </div>

              {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-sm font-medium border border-rose-200 dark:border-rose-500/20">{error}</div>}
              {success && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-500/20">{success}</div>}

              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Sign In</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function Login() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      if (res?.token) { try { localStorage.setItem('auth_token', res.token); } catch (e) { } }
      setUser({ ...res.user, id: res.user.id });
      nav('/');
    } catch (err) {
      setError(err?.message || 'Unable to login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-500 font-bold text-3xl mb-6">
          RBAC Pro
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-center mt-2">Sign in to your RBAC dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
              </div>

              {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-sm font-medium border border-rose-200 dark:border-rose-500/20">{error}</div>}

              <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed">
                  Empower your team with recognition, wellbeing and smart role visibility — all in one place.
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Don't have an account? <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Sign Up</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light'; } catch (e) { return 'light'; }
  });
  const [profileModalUser, setProfileModalUser] = useState(null);

  // Apply theme classes to the document root and persist selection
  useEffect(() => {
    try {
      const html = document.documentElement;
      // remove any existing theme- classes then add the current one
      ['theme-light', 'theme-dark', 'theme-blue', 'theme-forest', 'theme-neon', 'theme-minimal'].forEach(c => html.classList.remove(c));
      html.classList.add(`theme-${theme}`);
      // keep backward-compatible .dark class for existing dark styles
      html.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    } catch (e) { }
  }, [theme]);

  const toggleDark = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    (async () => {
      try { const me = await api('/auth/me'); setUser({ ...me, id: me._id }); } catch (e) { }
      setLoading(false);
    })();
  }, []);

  const logout = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); };
  // remove any stored token on logout
  const doLogout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch (e) { }
    try { localStorage.removeItem('auth_token'); } catch (e) { }
    setUser(null);
  };
  // expose doLogout to layout via provider (replace logout)
  // Note: keep `logout` name used by some UI behavior; we will use doLogout in provider value below.

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, logout: doLogout, theme, setTheme, dark: theme === 'dark', toggleDark, openProfile: setProfileModalUser }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* New Redesigned RBAC Layout */}
        <Route element={<Private><AppLayout /></Private>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/roles" element={<RoleManagement />} />
          <Route path="/permissions" element={<PermissionManagement />} />
          <Route path="/system-hub" element={<SystemHub />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Legacy Routes - kept for compatibility if needed */}
        <Route path="/gamification" element={<Private><Layout><Gamification user={user} /></Layout></Private>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
        <Route path="/kudos" element={<Private><Layout><Kudos /></Layout></Private>} />
      </Routes>

      {/* Global profile modal */}
      {profileModalUser && (
        <UserProfileModal
          user={profileModalUser}
          onClose={() => setProfileModalUser(null)}
        />
      )}
    </AuthCtx.Provider>
  );
}

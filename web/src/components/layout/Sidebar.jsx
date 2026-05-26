import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Users, Key, Settings, LayoutDashboard, FileText, LogOut, Info } from 'lucide-react';
import { useAuth } from '../../App';
import Avatar from '../Avatar';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Posts', path: '/posts', icon: <FileText size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Roles', path: '/roles', icon: <Shield size={20} /> },
    { name: 'Permissions', path: '/permissions', icon: <Key size={20} /> },
    { name: 'System Hub', path: '/system-hub', icon: <Info size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col h-full sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-zinc-200">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Shield size={24} className="fill-indigo-100" />
          RBAC Pro
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 px-3">
          Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar user={user} size="sm" className="shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-zinc-900 truncate max-w-[100px]">{user?.name || 'Loading...'}</span>
              <span className="text-xs text-zinc-500">{user?.role || ''}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

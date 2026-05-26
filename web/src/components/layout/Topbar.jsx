import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Clock } from 'lucide-react';

const SessionTimer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold shadow-sm animate-fade-in">
      <Clock size={14} className="text-indigo-500 animate-pulse" />
      <span>Session Time: {mins}m {secs}s</span>
    </div>
  );
};

const Topbar = () => {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button (hidden on desktop) */}
        <button className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors">
          <Menu size={20} />
        </button>
        
        {/* Search */}
        <div className="hidden sm:flex items-center relative">
          <Search size={16} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="pl-9 pr-4 py-2 w-64 bg-zinc-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm transition-all duration-200"
          />
          <div className="absolute right-3 flex items-center gap-1">
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 bg-zinc-200 rounded border border-zinc-300">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SessionTimer />
        <button className="relative p-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;

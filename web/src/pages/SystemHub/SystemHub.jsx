import React, { useState, useEffect } from 'react';
import { 
  Server, Database, Layout, ShieldCheck, Activity, Users, 
  Key, Lock, BookOpen, GitBranch, Terminal, PlayCircle, 
  HelpCircle, Star, Code, Briefcase, Info, ArrowRight, CheckCircle2
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SystemHub = () => {
  const [stats, setStats] = useState({ users: 0, roles: 0, posts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, roles, posts] = await Promise.all([
          api('/users'),
          api('/roles'),
          api('/posts')
        ]);
        setStats({ users: users.length, roles: roles.length, posts: posts.length });
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Soft background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-bold mb-6 shadow-sm">
            <Star size={16} className="fill-indigo-600" />
            Core Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Hub</span>
          </h1>
          <p className="text-zinc-500 text-lg sm:text-xl leading-relaxed max-w-xl">
            A dynamic role-based system with real-time control, advanced security protocols, and comprehensive analytics.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center justify-center shrink-0 pr-8">
          <div className="relative w-40 h-40">
            {/* Decorative background box */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl rotate-6 opacity-10"></div>
            {/* Main icon box */}
            <div className="absolute inset-0 bg-white border border-zinc-100 shadow-xl rounded-2xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0 duration-500">
              <ShieldCheck size={64} className="text-indigo-600 drop-shadow-sm" />
            </div>
            
            {/* Floating sub-icons */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
              <Lock size={20} className="text-purple-500" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <Activity size={20} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Main Details */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="text-indigo-500" size={20} />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
                RBAC Pro is an enterprise-grade Role-Based Access Control platform engineered to provide seamless security and permission management. It empowers administrators to dynamically configure roles, assign granular permissions across modules, and track user activities. By coupling state-of-the-art authentication with a beautiful modern interface, it ensures both robust security and exceptional user experience.
              </p>
            </CardContent>
          </Card>

          {/* Features Showcase */}
          <div>
            <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Star className="text-amber-500" size={20} /> Feature Showcase
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Key size={20} />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">Access Control</h3>
                <ul className="text-sm text-zinc-500 space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" /> Dynamic Roles</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" /> Granular Permissions</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" /> Module-Level Restrictions</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Activity size={20} />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">Dashboard Analytics</h3>
                <ul className="text-sm text-zinc-500 space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Real-time Metrics</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Interactive Graphs</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Profile Insights</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">Security Features</h3>
                <ul className="text-sm text-zinc-500 space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" /> Live Audit Logs</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" /> Session Tracking</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" /> Encrypted Credentials</li>
                </ul>
              </div>
            </div>
          </div>

          {/* System Architecture Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="text-indigo-500" size={20} />
                System Architecture
              </CardTitle>
              <CardDescription>A streamlined view of our request lifecycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 bg-zinc-50 rounded-xl border border-zinc-100 overflow-x-auto">
                <div className="flex flex-col items-center gap-2 text-center min-w-[80px]">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 uppercase">User</span>
                </div>
                
                <ArrowRight className="text-zinc-300 hidden sm:block shrink-0" size={24} />
                <div className="w-[2px] h-6 bg-zinc-300 sm:hidden"></div>

                <div className="flex flex-col items-center gap-2 text-center min-w-[80px]">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700">
                    <Lock size={20} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 uppercase">Auth</span>
                </div>

                <ArrowRight className="text-zinc-300 hidden sm:block shrink-0" size={24} />
                <div className="w-[2px] h-6 bg-zinc-300 sm:hidden"></div>

                <div className="flex flex-col items-center gap-2 text-center min-w-[80px]">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 shadow-sm border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 uppercase">Role Check</span>
                </div>

                <ArrowRight className="text-zinc-300 hidden sm:block shrink-0" size={24} />
                <div className="w-[2px] h-6 bg-zinc-300 sm:hidden"></div>

                <div className="flex flex-col items-center gap-2 text-center min-w-[80px]">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700">
                    <Key size={20} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 uppercase">Permission</span>
                </div>

                <ArrowRight className="text-zinc-300 hidden sm:block shrink-0" size={24} />
                <div className="w-[2px] h-6 bg-zinc-300 sm:hidden"></div>

                <div className="flex flex-col items-center gap-2 text-center min-w-[80px]">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 shadow-sm border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase">Access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="text-indigo-500" size={20} />
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <Layout size={18} className="text-indigo-500" />
                    <span className="font-medium text-sm text-zinc-700">Frontend</span>
                  </div>
                  <span className="text-xs font-semibold bg-white border border-zinc-200 px-2 py-1 rounded text-zinc-600">React + Tailwind</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <Server size={18} className="text-emerald-500" />
                    <span className="font-medium text-sm text-zinc-700">Backend</span>
                  </div>
                  <span className="text-xs font-semibold bg-white border border-zinc-200 px-2 py-1 rounded text-zinc-600">Node.js + Express</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <Database size={18} className="text-blue-500" />
                    <span className="font-medium text-sm text-zinc-700">Database</span>
                  </div>
                  <span className="text-xs font-semibold bg-white border border-zinc-200 px-2 py-1 rounded text-zinc-600">MongoDB</span>
                </div>
              </CardContent>
            </Card>

            {/* Developer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-indigo-500" size={20} />
                  Developer Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Creator</div>
                    <div className="font-medium text-zinc-900">Advanced RBAC Team</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Specialization</div>
                    <div className="font-medium text-zinc-900">Full-Stack Security & UI</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Frameworks</div>
                    <div className="font-medium text-zinc-900">MERN Stack Enterprise</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Right Column - Side Details */}
        <div className="space-y-8">

          {/* Live System Stats */}
          <Card className="bg-zinc-900 text-white border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Terminal size={18} className="text-emerald-400" />
                Live System Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                  <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-white">{stats.users}</div>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                  <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">System Roles</div>
                  <div className="text-2xl font-bold text-white">{stats.roles}</div>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                  <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Active Posts</div>
                  <div className="text-2xl font-bold text-white">{stats.posts}</div>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                  <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Sessions</div>
                  <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Live
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live System Stats */}

          {/* Version & Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Version & Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Current Version</span>
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">v2.1.0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Last Updated</span>
                <span className="font-medium text-zinc-900">Today</span>
              </div>
              <div className="pt-3 border-t border-zinc-100">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Upcoming</span>
                <ul className="text-sm text-zinc-600 space-y-1 list-disc pl-4">
                  <li>2FA Integration</li>
                  <li>Advanced Report Exports</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Help / Guide */}
          <Card className="bg-indigo-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <BookOpen className="text-indigo-600" size={20} />
                Quick Guides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full text-left flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100 text-sm font-medium text-indigo-900 hover:bg-indigo-50 transition-colors">
                How to assign roles?
                <ArrowRight size={16} className="text-indigo-400" />
              </button>
              <button className="w-full text-left flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100 text-sm font-medium text-indigo-900 hover:bg-indigo-50 transition-colors">
                How permissions work?
                <ArrowRight size={16} className="text-indigo-400" />
              </button>
            </CardContent>
          </Card>

          {/* Demo Button */}
          <Button variant="primary" className="w-full h-12 text-base gap-2 shadow-lg shadow-indigo-500/20 group">
            <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
            Explore Interactive Demo
          </Button>

        </div>
      </div>
    </div>
  );
};

export default SystemHub;

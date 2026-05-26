import React, { useState } from 'react';
import { User, Bell, Shield, Key, HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { useAuth } from '../../App';
import Avatar from '../../components/Avatar';
import { api } from '../../lib/api';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [prefs, setPrefs] = useState({
    securityAlerts: user?.preferences?.securityAlerts ?? true,
    productUpdates: user?.preferences?.productUpdates ?? false,
    mentions: user?.preferences?.mentions ?? true,
    twoFactor: user?.preferences?.twoFactor ?? false
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api('/users/settings', { method: 'PUT', body: JSON.stringify(form) });
      setUser(res);
      setMessage('Profile updated successfully');
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrefs = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api('/users/settings', { method: 'PUT', body: JSON.stringify({ preferences: prefs }) });
      setUser(res);
      setMessage('Preferences updated successfully');
    } catch (e) {
      setError(e.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!securityForm.currentPassword || !securityForm.newPassword) {
      setError('Please enter both current and new password');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api('/users/settings', { 
        method: 'PUT', 
        body: JSON.stringify({ 
          currentPassword: securityForm.currentPassword, 
          newPassword: securityForm.newPassword 
        }) 
      });
      setUser(res);
      setSecurityForm({ currentPassword: '', newPassword: '' });
      setMessage('Password updated successfully');
    } catch (e) {
      setError(e.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'api', label: 'API Keys', icon: <Key size={18} /> },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/20' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Update your personal information and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {message && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm">{message}</div>}
                  {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{error}</div>}
                  
                  <div className="flex items-center gap-6">
                    <Avatar user={user} size="xl" />
                    <div className="w-full max-w-sm">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Avatar URL</label>
                      <input 
                        type="text" 
                        value={form.avatar}
                        onChange={e => setForm({...form, avatar: e.target.value})}
                        placeholder="https://example.com/avatar.png"
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email || ''} 
                        disabled
                        className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 text-zinc-500 cursor-not-allowed rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Bio</label>
                      <textarea 
                        rows={3}
                        value={form.bio}
                        onChange={e => setForm({...form, bio: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm transition-all"
                        placeholder="Write a few sentences about yourself."
                      ></textarea>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-zinc-100 pt-4">
                  <Button variant="primary" onClick={handleSaveProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                </CardFooter>
              </Card>

              <Card className="border-rose-100">
                <CardHeader>
                  <CardTitle className="text-rose-600">Danger Zone</CardTitle>
                  <CardDescription>Permanently delete your account and all of your data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
                    Once you delete your account, there is no going back. Please be certain.
                  </div>
                </CardContent>
                <CardFooter className="border-t border-rose-100 pt-4">
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white">Delete Account</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what alerts you want to receive and how.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {message && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm">{message}</div>}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900 tracking-wide uppercase">Email Notifications</h3>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                    <div>
                      <div className="font-medium text-sm">Security Alerts</div>
                      <div className="text-xs text-zinc-500">Get notified when a login occurs from a new device.</div>
                    </div>
                    <Toggle enabled={prefs.securityAlerts} onChange={() => setPrefs({...prefs, securityAlerts: !prefs.securityAlerts})} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                    <div>
                      <div className="font-medium text-sm">Product Updates</div>
                      <div className="text-xs text-zinc-500">Receive emails about new features and improvements.</div>
                    </div>
                    <Toggle enabled={prefs.productUpdates} onChange={() => setPrefs({...prefs, productUpdates: !prefs.productUpdates})} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <h3 className="text-sm font-semibold text-zinc-900 tracking-wide uppercase">In-App Notifications</h3>
                  <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                    <div>
                      <div className="font-medium text-sm">Mentions & Kudos</div>
                      <div className="text-xs text-zinc-500">Notify me when someone tags me or gives me a kudo.</div>
                    </div>
                    <Toggle enabled={prefs.mentions} onChange={() => setPrefs({...prefs, mentions: !prefs.mentions})} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-zinc-100 pt-4">
                <Button variant="primary" onClick={handleSavePrefs} disabled={loading}>{loading ? 'Saving...' : 'Save Preferences'}</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Security & Access</CardTitle>
                <CardDescription>Manage your password and secure your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {message && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm">{message}</div>}
                {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{error}</div>}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Current Password</label>
                    <input type="password" value={securityForm.currentPassword} onChange={e => setSecurityForm({...securityForm, currentPassword: e.target.value})} placeholder="••••••••" className="w-full md:w-1/2 px-3 py-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">New Password</label>
                    <input type="password" value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})} placeholder="••••••••" className="w-full md:w-1/2 px-3 py-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm" />
                  </div>
                  <div>
                    <Button variant="secondary" onClick={handleSaveSecurity} disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">Two-Factor Authentication</div>
                      <div className="text-sm text-zinc-500 mt-1 max-w-md">Add an extra layer of security to your account by requiring a verification code in addition to your password.</div>
                    </div>
                    <Button variant="primary">Enable 2FA</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage keys used to authenticate API requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                    <Key size={24} />
                  </div>
                  <h3 className="font-medium text-zinc-900">No API Keys Generated</h3>
                  <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-6">You haven't created any API keys yet. Create one to start building custom integrations.</p>
                  <Button variant="primary" className="gap-2"><Plus size={16} /> Generate New Key</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

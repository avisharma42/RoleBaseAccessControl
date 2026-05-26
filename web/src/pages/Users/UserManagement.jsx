import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { api } from '../../lib/api';
import Avatar from '../../components/Avatar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingMap, setUpdatingMap] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoadingUsers(true);
    setErrorMsg('');
    try {
      const data = await api('/users');
      setUsers(data || []);
    } catch (e) {
      console.error('Failed to load users', e);
      setErrorMsg(e.message || 'Unable to load users');
    } finally { setLoadingUsers(false); }
  };

  useEffect(() => { load(); }, []);

  const update = async (id, patch) => {
    setUpdatingMap(m => ({ ...m, [id]: true }));
    setErrorMsg('');
    try {
      await api('/users/' + id, { method: 'PATCH', body: JSON.stringify(patch) });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, ...patch } : u));
    } catch (e) {
      console.error('Failed to update user', e);
      setErrorMsg(e.message || 'Update failed');
    } finally {
      setUpdatingMap(m => { const c = { ...m }; delete c[id]; return c; });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Users</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage user access and roles.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm transition-all"
            />
          </div>
          <Button variant="secondary" className="gap-2 shrink-0" onClick={load} disabled={loadingUsers}>
            <RefreshCw size={16} className={loadingUsers ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </CardHeader>

        {errorMsg && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-sm font-medium border border-rose-200 dark:border-rose-500/20">
            {errorMsg}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {loadingUsers && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">Loading users...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">No users found.</TableCell>
              </TableRow>
            ) : filteredUsers.map((user) => {
              const isUpdating = !!updatingMap[user._id];
              return (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="sm" />
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative inline-block">
                      <select 
                        value={user.role} 
                        onChange={e => update(user._id, { role: e.target.value })} 
                        disabled={isUpdating}
                        className={`appearance-none bg-transparent pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors
                          ${user.role === 'Admin' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' 
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'}
                          ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                      >
                        {['Admin', 'Editor', 'Viewer'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => update(user._id, { active: !user.active })} 
                      disabled={isUpdating}
                      className={`transition-all ${isUpdating ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                      <Badge variant={user.active ? 'success' : 'default'}>
                        {isUpdating ? 'Saving...' : (user.active ? 'Active' : 'Disabled')}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default UserManagement;

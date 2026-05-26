import React, { useState, useEffect } from 'react';
import { Plus, Users, ShieldAlert, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import PermissionAssignmentDrawer from './PermissionAssignmentDrawer';
import { useAuth } from '../../App';
import { api } from '../../lib/api';

const RoleManagement = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchRoles = async () => {
    try {
      const data = await api('/roles');
      setRoles(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsDrawerOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsDrawerOpen(true);
  };

  const handleDeleteRole = async (role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        await api(`/roles/${role._id || role.id}`, { method: 'DELETE' });
        fetchRoles();
      } catch (e) {
        alert(e.message || 'Failed to delete role');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Roles</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Define roles and manage module permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const permList = role.permissions ? Object.entries(role.permissions).filter(([k,v])=>v.read).map(([k,v])=>k) : [];
          return (
          <Card key={role._id || role.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{role.name}</CardTitle>
                  <CardDescription className="mt-2 h-10 line-clamp-2">{role.description}</CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <ShieldAlert size={20} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Key Permissions</div>
                  <div className="flex flex-wrap gap-2">
                    {permList.length > 0 ? permList.map(perm => (
                      <span key={perm} className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                        {perm}
                      </span>
                    )) : <span className="text-xs text-zinc-500">No specific permissions</span>}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <Users size={16} />
                {role.usersCount || 0} Users
              </div>
              {user?.role === 'Admin' && (
                <div className="flex items-center gap-2">
                  {!['Admin', 'Editor', 'Viewer'].includes(role.name) && (
                    <Button variant="ghost" size="sm" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDeleteRole(role)}>
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleEditRole(role)}>
                    <Edit2 size={14} />
                    Edit
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        )})}

        {user?.role === 'Admin' && (
          <button 
            onClick={handleCreateRole}
            className="group relative flex flex-col items-center justify-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all p-6 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 h-full min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-medium">Create New Role</span>
          </button>
        )}
      </div>

      <PermissionAssignmentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        role={selectedRole}
        onSave={() => {
          setIsDrawerOpen(false);
          fetchRoles();
        }}
      />
    </div>
  );
};

export default RoleManagement;

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import { api } from '../../lib/api';

const modulesList = [
  { id: 'users', name: 'User Management', description: 'Manage users, their details and status.' },
  { id: 'roles', name: 'Role Management', description: 'Create and edit roles and permissions.' },
  { id: 'content', name: 'Content', description: 'Manage website content and articles.' },
  { id: 'billing', name: 'Billing', description: 'Access to billing and subscription details.' },
];

const PermissionAssignmentDrawer = ({ isOpen, onClose, role, onSave }) => {
  const [permissions, setPermissions] = useState({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset or populate permissions based on the role selected
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
    } else {
      setName('');
      setDescription('');
    }
    
    const initialPerms = {};
    modulesList.forEach(mod => {
      initialPerms[mod.id] = {
        read: role?.permissions?.[mod.id]?.read || false,
        create: role?.permissions?.[mod.id]?.create || false,
        update: role?.permissions?.[mod.id]?.update || false,
        delete: role?.permissions?.[mod.id]?.delete || false
      };
    });
    setPermissions(initialPerms);
    setError('');
  }, [role, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (moduleId, action) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: !prev[moduleId][action]
      }
    }));
  };

  const handleSave = async () => {
    if (!role && !name.trim()) {
      setError('Role name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: role ? role.name : name.trim(),
        description: description.trim(),
        permissions
      };
      
      if (role && role._id) {
        await api(`/roles/${role._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/roles', { method: 'POST', body: JSON.stringify(payload) });
      }
      
      if (onSave) onSave();
    } catch (e) {
      setError(e.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-zinc-950/20 dark:bg-zinc-950/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {role ? 'Edit Role Permissions' : 'Create New Role'}
            </h2>
            {role && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{role.name}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          {!role && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing Manager" 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-zinc-100 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea 
                  rows="2" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the role..." 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-zinc-100 transition-all resize-none"
                ></textarea>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Module Permissions</h3>
            </div>

            {modulesList.map(module => (
              <div key={module.id} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="mb-4">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{module.name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{module.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {['read', 'create', 'update', 'delete'].map(action => (
                    <div key={action} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{action}</span>
                      <Toggle 
                        enabled={permissions[module.id]?.[action] || false}
                        onChange={() => handleToggle(module.id, action)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading} className="gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};

export default PermissionAssignmentDrawer;

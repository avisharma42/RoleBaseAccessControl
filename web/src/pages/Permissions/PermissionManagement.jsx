import React from 'react';
import { Search, ShieldAlert, Check, X, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Toggle from '../../components/ui/Toggle';

const modules = [
  { id: 'users', name: 'User Management', desc: 'Manage user accounts and profiles' },
  { id: 'roles', name: 'Role Management', desc: 'Create and edit roles' },
  { id: 'posts', name: 'Posts & Content', desc: 'Publish and moderate content' },
  { id: 'billing', name: 'Billing', desc: 'Manage subscriptions and invoices' },
  { id: 'settings', name: 'System Settings', desc: 'Global platform configuration' }
];

const roles = ['Admin', 'Editor', 'Viewer'];

// Mock permissions matrix state
const permissionsMatrix = {
  Admin: { users: true, roles: true, posts: true, billing: true, settings: true },
  Editor: { users: false, roles: false, posts: true, billing: false, settings: false },
  Viewer: { users: false, roles: false, posts: 'read-only', billing: false, settings: false }
};

const PermissionManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Permission Matrix</h1>
          <p className="text-sm text-zinc-500 mt-1">Granular control over what each role can access.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <ShieldAlert size={16} />
          Audit Logs
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search modules..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Info size={16} />
            Changes are saved automatically
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50">
                <TableHead className="w-[300px]">Modules</TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center font-semibold text-zinc-900">
                    <div className="flex flex-col items-center gap-1">
                      {role}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <tbody>
              {modules.map(mod => (
                <TableRow key={mod.id}>
                  <TableCell>
                    <div className="font-medium text-zinc-900">{mod.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{mod.desc}</div>
                  </TableCell>
                  {roles.map(role => {
                    const access = permissionsMatrix[role][mod.id];
                    // If admin, show locked checkmark
                    if (role === 'Admin') {
                      return (
                        <TableCell key={`${role}-${mod.id}`} className="text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-not-allowed opacity-80" title="Admin access cannot be revoked">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        </TableCell>
                      );
                    }
                    
                    // Specific complex case example
                    if (access === 'read-only') {
                       return (
                        <TableCell key={`${role}-${mod.id}`} className="text-center">
                          <div className="inline-flex items-center gap-2">
                             <select className="text-xs font-medium bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-zinc-700 outline-none focus:border-indigo-500 transition-colors">
                                <option>Read Only</option>
                                <option>Full Access</option>
                                <option>None</option>
                             </select>
                          </div>
                        </TableCell>
                       )
                    }

                    return (
                      <TableCell key={`${role}-${mod.id}`} className="text-center">
                        <div className="flex justify-center">
                          <Toggle enabled={access === true} />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PermissionManagement;

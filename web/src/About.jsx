import React from 'react';

export default function About(){
  return (
    <div className="prose max-w-none">
      <div className="bg-white rounded-xl shadow p-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Help & About</h1>
          <p className="text-sm text-slate-500 mt-1">A quick guide to RBAC, why it matters, and the technologies behind this demo.</p>
        </header>

        <section className="mb-6">
          <h2 className="text-lg font-semibold">What is RBAC?</h2>
          <p className="text-sm text-slate-700">Role-Based Access Control (RBAC) is a method for restricting system access to users based on their assigned roles. Instead of granting permissions to individual users, permissions are associated with roles (like Admin, Editor, Viewer), and users are assigned to roles. This simplifies permission management and keeps authorization predictable and auditable.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold">Why RBAC is useful</h2>
          <ul className="list-disc list-inside text-sm text-slate-700">
            <li>Scales with teams: Assigning roles is easier than assigning granular permissions per user.</li>
            <li>Least privilege: Users get only the access they need (reduces mistakes and risk).</li>
            <li>Clear separation of duties: Roles map to responsibilities (e.g., Editors create content, Admins manage users).</li>
            <li>Auditing & compliance: Role-based policies are easier to review and document for audits.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold">How this demo applies RBAC</h2>
          <p className="text-sm text-slate-700">This project demonstrates a simple RBAC system with three built-in roles:</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="p-3 border rounded">
              <div className="font-semibold">Admin</div>
              <div className="text-xs text-slate-500">Full access — manage posts & users</div>
            </div>
            <div className="p-3 border rounded">
              <div className="font-semibold">Editor</div>
              <div className="text-xs text-slate-500">Create and edit content</div>
            </div>
            <div className="p-3 border rounded">
              <div className="font-semibold">Viewer</div>
              <div className="text-xs text-slate-500">Read-only access</div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold">Tech used in this project</h2>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <div><strong>Frontend:</strong> React + Vite, Tailwind CSS for UI, React Router for navigation.</div>
            <div><strong>Backend:</strong> Node.js / Express API (in the <code>api/</code> folder) with simple session auth.</div>
            <div><strong>Data:</strong> MongoDB for persistent storage (posts and users).</div>
            <div><strong>Build & tooling:</strong> esbuild / Vite, PostCSS, Tailwind config for theming.</div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold">Why these choices?</h2>
          <ul className="list-disc list-inside text-sm text-slate-700">
            <li><strong>React</strong> — fast component-centric UI and a large ecosystem (perfect for interactive dashboards).</li>
            <li><strong>Vite</strong> — lightning-fast dev server and simple build pipeline.</li>
            <li><strong>Tailwind CSS</strong> — utility-first styling for rapid layout and consistent design tokens (works well for teacher demos and prototypes).</li>
            <li><strong>Node + Express</strong> — minimal, widely-known backend that's easy to follow in class and extend for exercises.</li>
            <li><strong>MongoDB</strong> — flexible document model that fits posts/users data without heavy schema work for early labs.</li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="text-lg font-semibold">Teaching tips</h2>
          <p className="text-sm text-slate-700">This repo is intentionally compact so instructors can demonstrate core concepts quickly: authentication, role gates, UI state, and CRUD operations. Try logging in as each demo user to see how the UI changes with role permissions.</p>
        </section>

        <footer className="text-xs text-slate-500 mt-4">
          Demo built for learning — tweak roles, add permissions, and extend the API for exercises. If you'd like, I can add printable handouts or slides summarizing RBAC and the code flow.
        </footer>
      </div>
    </div>
  );
}

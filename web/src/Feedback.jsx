import React, { useState, useEffect } from 'react';
import { api } from './lib/api';

export default function Feedback(){
  const [category, setCategory] = useState('Safety');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [adminList, setAdminList] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(()=>{
    // determine role (if logged in)
    (async ()=>{
      try{ const me = await api('/auth/me'); setUserRole(me.role); }catch(e){}
    })();
  },[]);

  const submit = async (e)=>{
    e && e.preventDefault();
    setStatus(null);
    try{
      await api('/feedback', { method:'POST', body: JSON.stringify({ category, message }) });
      setStatus({ ok:true, msg: 'Thanks — your feedback was submitted anonymously.' });
      setMessage('');
    }catch(err){ setStatus({ ok:false, msg: err.message || 'Failed' }); }
  };

  const loadAdmin = async ()=>{
    setLoadingAdmin(true);
    try{ const items = await api('/feedback'); setAdminList(items); }catch(e){ }
    setLoadingAdmin(false);
  };

  const toggleResolve = async (id, resolved)=>{
    try{
      await api('/feedback/'+id+'/resolve', { method:'PATCH', body: JSON.stringify({ resolved: !resolved }) });
      loadAdmin();
    }catch(e){ alert('Unable to update'); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold">Anonymous Feedback</h2>
        <p className="text-sm text-slate-500">Share concerns, praise, or system improvement ideas — anonymously.</p>
        <form onSubmit={submit} className="mt-3 space-y-2">
          <div>
            <label className="text-sm">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="ml-2 border rounded px-2 py-1">
              <option>Safety</option>
              <option>System improvement</option>
              <option>Complaint</option>
              <option>Appreciation</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Your feedback (min 5 chars)" className="w-full border rounded px-3 py-2" rows={4} />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 bg-black text-white rounded">Submit anonymously</button>
            <div className="text-sm text-slate-500">We will never attach your identity.</div>
          </div>
          {status && (
            <div className={`text-sm ${status.ok? 'text-green-600' : 'text-red-600'}`}>{status.msg}</div>
          )}
        </form>
      </div>

      {/* Admin section */}
      {userRole === 'Admin' && (
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Admin: Feedback Center</h3>
            <div>
              <button onClick={loadAdmin} className="px-3 py-1 bg-slate-200 rounded">Refresh</button>
            </div>
          </div>
          {loadingAdmin ? <div>Loading...</div> : (
            <div className="space-y-2">
              {adminList.length === 0 && <div className="text-sm text-slate-500">No feedback yet.</div>}
              {adminList.map(f=> (
                <div key={f._id} className={`border rounded p-3 ${f.resolved? 'bg-slate-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{f.category} {f.resolved && <span className="text-xs text-green-600">(Resolved)</span>}</div>
                      <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{f.message}</div>
                      <div className="text-xs text-slate-400 mt-2">{new Date(f.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="shrink-0 flex flex-col gap-2">
                      <button onClick={()=>toggleResolve(f._id, f.resolved)} className={`px-2 py-1 rounded ${f.resolved? 'bg-yellow-400' : 'bg-green-600 text-white'}`}>{f.resolved? 'Reopen' : 'Resolve'}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

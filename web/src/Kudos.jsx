import React, { useEffect, useState } from 'react';
import { getMonthlyLeaderboard, api } from './lib/api';
import Avatar from './components/Avatar';
import { useAuth } from './App';

export default function Kudos(){
  const { openProfile } = useAuth();
  const [entries, setEntries] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(false);

  const load = async ()=>{
    setLoading(true);
    try{
      const lb = await getMonthlyLeaderboard();
      setEntries(lb || []);
      // fetch all users once to map ids -> names (small app, acceptable)
      const users = await api('/users');
      const map = {};
      users.forEach(u=> map[u._id] = u);
      setUsersMap(map);
    }catch(e){
      console.error('Failed to load leaderboard', e);
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Kudos — Monthly Leaderboard</h2>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-3 py-1 bg-slate-200 rounded text-sm">Refresh</button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">#</th>
              <th>Name</th>
              <th>Role</th>
              <th className="text-right">Kudos</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-slate-500">No kudos this month yet.</td></tr>
            )}
            {entries.map((e, i)=> {
              const user = usersMap[e._id];
              return (
                <tr key={e._id} className="border-t">
                  <td className="py-2 w-10">{i+1}</td>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar user={user || { name: e._id, id: e._id }} size="sm" onClick={() => user && openProfile && openProfile(user)} />
                      <span>{user?.name || e._id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {user?.role || '—'}
                    </span>
                  </td>
                  <td className="text-right font-semibold">{e.count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

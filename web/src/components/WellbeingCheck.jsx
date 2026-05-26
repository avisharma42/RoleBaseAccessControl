import React, { useState, useEffect } from 'react';
import { submitWellbeingCheck, getTodaysCheck, getWellbeingMessages } from '../lib/api';

export default function WellbeingCheck() {
  const [showCheck, setShowCheck] = useState(false);
  const [mood, setMood] = useState(null);
  const [journal, setJournal] = useState('');
  const [message, setMessage] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [todaysCheck, setTodaysCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => { checkToday(); }, []);

  async function checkToday(){
    try{
      const check = await getTodaysCheck();
      if(check){
        setTodaysCheck(check);
        const msgs = await getWellbeingMessages(check.mood);
        setMessage(msgs.message);
        setSuggestion(msgs.suggestion);
      } else {
        setShowCheck(true);
      }
    }catch(e){ console.debug('Failed to load today check', e); }
  }

  async function handleMoodSelect(selected){
    setMood(selected);
    try{
      const msgs = await getWellbeingMessages(selected);
      setMessage(msgs.message);
      setSuggestion(msgs.suggestion);
    }catch(e){ console.debug('Failed to fetch messages', e); }
  }

  async function handleSubmit(){
    if(!mood) return;
    setLoading(true);
    try{
      const check = await submitWellbeingCheck(mood, journal);
      setTodaysCheck(check);
      setShowCheck(false);
    }catch(e){ console.debug('Submit failed', e); }
    finally{ setLoading(false); }
  }

  function handleReset(){
    // client-side reset (server-side deletion endpoint can be added later)
    setShowResetConfirm(false);
    setTodaysCheck(null);
    setMood(null);
    setJournal('');
    setMessage(null);
    setSuggestion(null);
    setShowCheck(true);
  }

  if(loading) return (
    <div className="wellbeing-container">
      <div className="animate-pulse py-3">Saving your check-in...</div>
    </div>
  );

  // Reset confirmation dialog
  if(showResetConfirm) return (
    <div className="wellbeing-container">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Start fresh?</h3>
        <p className="text-sm text-slate-500 mt-2">This will clear today's mood and let you check in again.</p>
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={()=>setShowResetConfirm(false)} className="save-button bg-slate-100 !bg-gradient-to-r from-slate-400 to-slate-500">Keep current</button>
        <button onClick={handleReset} className="save-button !bg-gradient-to-r from-red-500 to-rose-600">Start fresh</button>
      </div>
    </div>
  );

  if(!showCheck && todaysCheck){
    const lastUpdated = new Date(todaysCheck.timestamp).toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit', hour12:true });
    return (
      <div className="wellbeing-container">
        <div className="text-center mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Today's Check-in</div>
            <div className="text-xs text-slate-500">Last updated: {lastUpdated}</div>
          </div>
          <div className="text-4xl mb-3 transform transition-all hover:scale-110">{todaysCheck.mood}</div>
          {todaysCheck.journal && (
            <div className="text-sm text-slate-600 mt-2 italic message-box">
              "{todaysCheck.journal}"
            </div>
          )}
        </div>
        <div className="border-t pt-3 mt-3">
          <div className="text-sm font-medium mb-2">Your Daily Insight:</div>
          <div className="text-sm text-slate-600 message-box mb-2">{message}</div>
          <div className="text-sm text-slate-600 message-box">
            <span className="font-medium">Suggestion: </span>{suggestion}
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={()=>{ setShowCheck(true); setMood(todaysCheck.mood); setJournal(todaysCheck.journal || ''); }} 
            className="save-button !bg-gradient-to-r from-blue-500 to-indigo-500">
            Update mood
          </button>
          <button onClick={()=>setShowResetConfirm(true)} 
            className="save-button !bg-gradient-to-r from-red-500 to-rose-600">
            Start fresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wellbeing-container">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          How are you feeling today?
        </h3>
        <p className="text-sm text-slate-500 mt-2">Take a moment to check in with yourself</p>
      </div>

      <div className="flex justify-center gap-6 mb-6">
        {['😊','🙂','😐','☹️','😢'].map(m => (
          <button 
            key={m} 
            onClick={()=>handleMoodSelect(m)} 
            title={m} 
            className={`mood-button text-3xl ${mood===m ? 'selected' : ''}`}
          >
            {m}
          </button>
        ))}
      </div>

      {mood && (
        <>
          {message && (
            <div className="mb-6 text-center space-y-3">
              <div className="message-box">
                <p className="text-slate-700">{message}</p>
              </div>
              <div className="message-box bg-gradient-to-r from-blue-50 to-indigo-50">
                <p className="text-sm text-slate-600">{suggestion}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm text-slate-600 mb-2 font-medium">
              Would you like to write about it? (Optional)
            </label>
            <textarea 
              value={journal} 
              onChange={e=>setJournal(e.target.value)} 
              className="w-full border rounded-lg p-3 text-sm" 
              placeholder="Your thoughts..." 
              rows={3} 
            />
          </div>

          <div className="text-center">
            <button 
              onClick={handleSubmit} 
              className="save-button"
            >
              Save Check-in
            </button>
          </div>
        </>
      )}
    </div>
  );
}

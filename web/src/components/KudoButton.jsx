x// Small Kudo button component: shows count and allows sending a kudo for a post
function KudoButton({ postId, authorId }){
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasGiven, setHasGiven] = useState(false);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const res = await getPostKudoCount(postId);
        if(mounted) setCount((res && typeof res.count === 'number') ? res.count : 0);
      }catch(e){
        console.debug('Kudo count fetch failed', e);
      }
    })();
    return ()=> mounted = false;
  },[postId]);

  const send = async ()=>{
    if(!user) return alert('Please sign in to give a kudo');
    if(String(user.id) === String(authorId)){
      // Prevent self-kudos on client
      return alert('You cannot give a kudo to your own post');
    }
    if(hasGiven) return;
    setLoading(true);
    setError('');
    try{
      const res = await giveKudo(postId);
      if(res && res.already){
        setHasGiven(true);
        setError('You already gave a kudo to this post');
      } else if(res.ok) {
        setHasGiven(true);
      }
      // refresh authoritative count from server
      try{
        const fresh = await getPostKudoCount(postId);
        setCount((fresh && typeof fresh.count === 'number') ? fresh.count : count);
      }catch(e){ console.debug('Failed to refresh kudo count', e); }
    }catch(e){
      const msg = (e && e.message) ? e.message : 'Unable to send kudo';
      setError(msg);
    }finally{ setLoading(false); }
  };

  const disabled = loading || hasGiven || String(user?.id)===String(authorId);
  const title = String(user?.id)===String(authorId) ? 'Cannot kudo your own post'
              : hasGiven ? 'Already gave a kudo'
              : 'Give a kudo';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`text-sm ${hasGiven ? 'text-pink-500 dark:text-pink-400' : 'text-slate-500'}`}>
        {count}
        <span aria-hidden className={`ml-1 inline-block transition-transform ${hasGiven ? 'scale-110' : ''}`}>
          {hasGiven ? '❤️' : '🤍'}
        </span>
      </div>
      <button 
        onClick={send} 
        disabled={disabled}
        title={title}
        className={`
          px-3 py-1.5 text-xs font-medium rounded-md 
          transition-all duration-200 transform hover:scale-105 active:scale-95
          border shadow-sm
          ${disabled ? 
            'opacity-50 cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200' :
            'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-600 hover:from-pink-600 hover:to-rose-600'
          }
          dark:border-slate-600
        `}
      >
        {loading ? 'Sending...' : hasGiven ? 'Kudoed!' : 'Give Kudo'}
      </button>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
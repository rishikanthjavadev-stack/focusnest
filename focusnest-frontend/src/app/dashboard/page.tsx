'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [time, setTime]   = useState(new Date());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }

    const onboarding = localStorage.getItem('fn_onboarding');
    if (!onboarding) { router.push('/onboarding'); return; }

    try {
      const raw = localStorage.getItem('fn_user');
      if (raw) {
        const u = JSON.parse(raw);
        setName(u.name  || '');
        setEmail(u.email || '');
      }
    } catch {}

    setReady(true);
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [router]);

  const logout = () => { localStorage.clear(); router.push('/login'); };

  if (!ready) return (
    <div style={{ minHeight:'100vh', background:'#0c0f0a',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>🪺</div>
  );

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name ? (name.includes(' ') ? name.split(' ')[0] : name) : 'there';

  return (
    <div style={{ minHeight:'100vh', background:'#0c0f0a',
      fontFamily:"'Outfit', sans-serif", color:'#e8e0cc' }}>

      {/* Top bar */}
      <div style={{ background:'#141710', borderBottom:'1px solid #252b1f',
        padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'8px',
            background:'linear-gradient(135deg,#4a7c59,#8fad7c)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🪺</div>
          <span style={{ fontFamily:"'Fraunces', serif", fontSize:'17px', fontWeight:'700' }}>FocusNest</span>
        </div>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'22px', color:'#6db882' }}>
          {time.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {email && <span style={{ fontSize:'13px', color:'#5a6355' }}>{email}</span>}
          <button onClick={logout} style={{ padding:'8px 16px', borderRadius:'8px',
            background:'transparent', border:'1px solid #252b1f',
            color:'#5a6355', cursor:'pointer', fontSize:'13px' }}>Sign out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'32px 28px' }}>
        <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:'28px',
          fontWeight:'700', marginBottom:'6px' }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ color:'#5a6355', fontSize:'14px', marginBottom:'32px' }}>
          Build your focus. Grow your skills.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
          gap:'16px', marginBottom:'32px' }}>
          {[
            { icon:'⏱', label:"Today's Study", value:'0h 0m',  color:'#6db882' },
            { icon:'🔥', label:'Day Streak',    value:'0 days', color:'#d4872a' },
            { icon:'✅', label:'Sessions Done', value:'0 / 0',  color:'#8fad7c' },
            { icon:'🎯', label:'Goal Progress', value:'0%',     color:'#4a9ead' },
          ].map(card => (
            <div key={card.label} style={{ background:'#1a1e16', borderRadius:'12px',
              padding:'20px', border:'1px solid #252b1f' }}>
              <div style={{ fontSize:'24px', marginBottom:'10px' }}>{card.icon}</div>
              <div style={{ fontFamily:"'Fraunces', serif", fontSize:'24px',
                fontWeight:'700', color:card.color }}>{card.value}</div>
              <div style={{ fontSize:'12px', color:'#5a6355', marginTop:'4px' }}>{card.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:'#1a1e16', borderRadius:'12px', padding:'24px',
          border:'1px solid #4a7c5922' }}>
          <div style={{ fontSize:'11px', fontFamily:"'DM Mono', monospace",
            color:'#6db882', letterSpacing:'1.5px', marginBottom:'12px' }}>
            🪺 YOUR NEST IS READY
          </div>
          <p style={{ fontSize:'15px', color:'#8fad7c', lineHeight:'1.7' }}>
            Backend API ✅ &nbsp;·&nbsp; Database ✅ &nbsp;·&nbsp; Auth ✅ &nbsp;·&nbsp; Onboarding ✅
          </p>
          {email && (
            <p style={{ fontSize:'13px', color:'#5a6355', marginTop:'8px' }}>
              Logged in as <strong style={{ color:'#e8e0cc' }}>{email}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

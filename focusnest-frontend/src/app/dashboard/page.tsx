'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/services/api';

const PomodoroTimer = dynamic(() => import('@/components/PomodoroTimer'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [time, setTime]       = useState(new Date());
  const [ready, setReady]     = useState(false);
  const [clockVisible, setClockVisible] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [stats, setStats]     = useState({ todaySeconds:0, streakDays:0, todaySessions:0 });

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }

    // Fetch user from backend for name/email only
    api.get('/users/me').then(({ data }) => {
      setName(data.name || '');
      setEmail(data.email || '');
      localStorage.setItem('fn_user', JSON.stringify(data));
      setReady(true);
    }).catch(() => {
      router.push('/login');
    });

    const t = setInterval(() => setTime(new Date()), 1000);
    api.get('/sessions/stats').then(({ data }) => setStats({
      todaySeconds:  data.todaySeconds  || 0,
      streakDays:    data.streakDays    || 0,
      todaySessions: data.todaySessions || 0,
    })).catch(() => {});
    return () => clearInterval(t);
  }, [router]);

  const handleSignOut = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!ready) return (
    <div style={{ minHeight:'100vh', background:'#0c0f0a',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>🪺</div>
  );

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name ? (name.includes(' ') ? name.split(' ')[0] : name) : 'there';

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0c0f0a',
      fontFamily:"'Outfit', sans-serif", color:'#e8e0cc' }}>

      {/* Top bar */}
      <div style={{ background:'#141710', borderBottom:'1px solid #252b1f',
        padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
          color:'#5a6355', letterSpacing:'1.5px' }}>DASHBOARD</div>

        {/* Center clock — hidden until hover */}
        <div
          onMouseEnter={() => setClockVisible(true)}
          onMouseLeave={() => setClockVisible(false)}
          style={{ position:'absolute', left:'50%', transform:'translateX(-50%)',
            padding:'6px 16px', borderRadius:'20px', cursor:'default',
            background: clockVisible ? '#1a1f15' : 'transparent',
            border: clockVisible ? '1px solid #252b1f' : '1px solid transparent',
            transition:'all 0.3s ease' }}>
          <div style={{
            fontFamily:"'DM Mono', monospace", fontSize:'20px', color:'#6db882',
            opacity: clockVisible ? 1 : 0.08,
            transition:'opacity 0.3s ease',
            userSelect:'none' }}>
            {time.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
          </div>
        </div>

        {/* User menu */}
        <div style={{ position:'relative' }}>
          <div
            onClick={() => setMenuOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', gap:'8px',
              cursor:'pointer', padding:'6px 12px', borderRadius:'8px',
              background: menuOpen ? '#1a1f15' : 'transparent',
              border:'1px solid', borderColor: menuOpen ? '#4a7c59' : '#252b1f',
              transition:'all 0.2s' }}>
            <div style={{ width:'26px', height:'26px', borderRadius:'50%',
              background:'linear-gradient(135deg,#4a7c59,#8fad7c)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'11px', fontWeight:'700', color:'#0c0f0a' }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize:'12px', color:'#a8b89e', maxWidth:'120px',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {name || email}
            </span>
            <span style={{ fontSize:'10px', color:'#5a6355' }}>{menuOpen ? '▲' : '▼'}</span>
          </div>

          {menuOpen && (
            <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'#141710', border:'1px solid #252b1f', borderRadius:'10px',
              padding:'8px', minWidth:'180px', zIndex:100,
              boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
              <div style={{ padding:'8px 12px', fontSize:'11px',
                color:'#5a6355', fontFamily:"'DM Mono', monospace",
                borderBottom:'1px solid #252b1f', marginBottom:'6px' }}>
                {email}
              </div>
              <button
                onClick={() => router.push('/profile')}
                style={{ width:'100%', textAlign:'left', padding:'8px 12px',
                  background:'transparent', border:'none', color:'#a8b89e',
                  fontSize:'13px', cursor:'pointer', borderRadius:'6px' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1a1f15')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                👤 Profile
              </button>
              <button
                onClick={handleSignOut}
                style={{ width:'100%', textAlign:'left', padding:'8px 12px',
                  background:'transparent', border:'none', color:'#e05252',
                  fontSize:'13px', cursor:'pointer', borderRadius:'6px' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1a1f15')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', minHeight:'calc(100vh - 57px)' }}>

        {/* Left */}
        <div style={{ padding:'28px 28px' }}>
          <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:'26px',
            fontWeight:'700', marginBottom:'4px' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color:'#5a6355', fontSize:'13px', marginBottom:'28px' }}>
            Build your focus. Grow your skills.
          </p>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)',
            gap:'12px', marginBottom:'24px' }}>
            {[
              { icon:'⏱', label:"Today's Study", value: fmt(stats.todaySeconds), color:'#6db882' },
              { icon:'✅', label:'Sessions Today', value: String(stats.todaySessions), color:'#8fad7c' },
              { icon:'🔥', label:'Day Streak',    value: `${stats.streakDays}d`, color:'#d4872a' },
            ].map(card => (
              <div key={card.label} style={{ background:'#141710', borderRadius:'12px',
                padding:'18px', border:'1px solid #252b1f' }}>
                <div style={{ fontSize:'20px', marginBottom:'8px' }}>{card.icon}</div>
                <div style={{ fontFamily:"'Fraunces', serif", fontSize:'22px',
                  fontWeight:'700', color:card.color }}>{card.value}</div>
                <div style={{ fontSize:'11px', color:'#5a6355', marginTop:'3px',
                  fontFamily:"'DM Mono', monospace", letterSpacing:'0.5px' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { icon:'📝', label:'My Notes',   sub:'Capture insights',  path:'/notes',     color:'#4a7c59' },
              { icon:'📊', label:'Analytics',  sub:'View progress',     path:'/analytics', color:'#4a9ead' },
              { icon:'⏱', label:'Timer',       sub:'Start a session',   path:'/timer',     color:'#d4872a' },
              { icon:'🪺', label:'FocusNest',  sub:'Backend API ✅ · DB ✅ · Auth ✅', path:'#', color:'#8fad7c' },
            ].map(card => (
              <div key={card.label}
                onClick={() => card.path !== '#' && router.push(card.path)}
                style={{ background:'#141710', borderRadius:'12px', padding:'18px',
                  border:'1px solid #252b1f', cursor: card.path !== '#' ? 'pointer' : 'default',
                  transition:'border-color 0.2s' }}
                onMouseEnter={e => card.path !== '#' && ((e.currentTarget as HTMLElement).style.borderColor = card.color+'66')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#252b1f')}>
                <div style={{ fontSize:'22px', marginBottom:'8px' }}>{card.icon}</div>
                <div style={{ fontSize:'14px', fontWeight:'700', color:'#e8e0cc',
                  marginBottom:'3px' }}>{card.label}</div>
                <div style={{ fontSize:'11px', color:'#5a6355' }}>{card.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Timer */}
        <div style={{ padding:'28px 24px', background:'#0e110c',
          borderLeft:'1px solid #252b1f', display:'flex', flexDirection:'column' }}>
          <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
            color:'#5a6355', letterSpacing:'1.5px', marginBottom:'20px' }}>
            POMODORO TIMER
          </div>
          <Suspense fallback={<div style={{ color:'#5a6355' }}>Loading...</div>}>
            <PomodoroTimer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

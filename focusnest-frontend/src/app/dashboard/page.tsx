'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/services/api';

const PomodoroTimer = dynamic(() => import('@/components/PomodoroTimer'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [time, setTime]     = useState(new Date());
  const [ready, setReady]   = useState(false);
  const [stats, setStats]   = useState({ todaySeconds:0, streakDays:0, todaySessions:0 });

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }
    const onboarding = localStorage.getItem('fn_onboarding');
    if (!onboarding) { router.push('/onboarding'); return; }
    try {
      const raw = localStorage.getItem('fn_user');
      if (raw) { const u = JSON.parse(raw); setName(u.name||''); setEmail(u.email||''); }
    } catch {}
    setReady(true);
    const t = setInterval(() => setTime(new Date()), 1000);
    api.get('/sessions/stats').then(({ data }) => setStats({
      todaySeconds:  data.todaySeconds  || 0,
      streakDays:    data.streakDays    || 0,
      todaySessions: data.todaySessions || 0,
    })).catch(() => {});
    return () => clearInterval(t);
  }, [router]);

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
        <div>
          <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
            color:'#5a6355', letterSpacing:'1.5px' }}>DASHBOARD</div>
        </div>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'20px', color:'#6db882' }}>
          {time.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
        </div>
        {email && <span style={{ fontSize:'12px', color:'#5a6355' }}>{email}</span>}
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
              { icon:'📝', label:'My Notes', sub:'Capture insights', path:'/notes', color:'#4a7c59' },
              { icon:'📊', label:'Analytics', sub:'View progress', path:'/analytics', color:'#4a9ead' },
              { icon:'⏱', label:'Timer',     sub:'Start a session', path:'/timer', color:'#d4872a' },
              { icon:'🪺', label:'FocusNest', sub:'Backend API ✅ · DB ✅ · Auth ✅', path:'#', color:'#8fad7c' },
            ].map(card => (
              <div key={card.label}
                onClick={() => card.path !== '#' && router.push(card.path)}
                style={{ background:'#141710', borderRadius:'12px', padding:'18px',
                  border:`1px solid #252b1f`, cursor: card.path !== '#' ? 'pointer' : 'default',
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

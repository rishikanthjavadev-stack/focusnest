'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const PomodoroTimer = dynamic(() => import('@/components/PomodoroTimer'), { ssr: false });

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
        setName(u.name || '');
        setEmail(u.email || '');
      }
    } catch {}

    setReady(true);
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [router]);

  const logout = () => { localStorage.clear(); router.push('/login'); };

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: '#0c0f0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🪺</div>
  );

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = name ? (name.includes(' ') ? name.split(' ')[0] : name) : 'there';

  return (
    <div style={{ minHeight: '100vh', background: '#0c0f0a',
      fontFamily: "'Outfit', sans-serif", color: '#e8e0cc' }}>

      {/* Top bar */}
      <div style={{ background: '#141710', borderBottom: '1px solid #252b1f',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#4a7c59,#8fad7c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🪺</div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: '700' }}>FocusNest</span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '20px', color: '#6db882' }}>
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {email && <span style={{ fontSize: '12px', color: '#5a6355' }}>{email}</span>}
          <button onClick={() => router.push("/notes")} style={{ padding:"7px 14px", borderRadius:"8px", background:"transparent", border:`1px solid ${'#252b1f'}`, color:"#8fad7c", cursor:"pointer", fontSize:"12px", marginRight:"8px" }}>📝 Notes</button>
          <button onClick={logout} style={{ padding: '7px 14px', borderRadius: '8px',
            background: 'transparent', border: '1px solid #252b1f',
            color: '#5a6355', cursor: 'pointer', fontSize: '12px' }}>Sign out</button>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px',
        gap: '0', minHeight: 'calc(100vh - 58px)' }}>

        {/* Left — greeting + info */}
        <div style={{ padding: '32px 28px', borderRight: '1px solid #252b1f' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '26px',
            fontWeight: '700', marginBottom: '6px' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: '#5a6355', fontSize: '13px', marginBottom: '32px' }}>
            Build your focus. Grow your skills.
          </p>

          {/* Quick tips */}
          <div style={{ background: '#141710', borderRadius: '12px',
            padding: '20px', border: '1px solid #252b1f', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace",
              color: '#6db882', letterSpacing: '1.5px', marginBottom: '12px' }}>
              🪺 HOW POMODORO WORKS
            </div>
            {[
              { icon: '▶', text: 'Press Start to begin a 25-min focus session' },
              { icon: '☕', text: 'Take a 5-min break when the timer ends' },
              { icon: '🔄', text: 'Repeat — every session is saved to your stats' },
              { icon: '🔥', text: 'Complete sessions daily to build your streak' },
            ].map(t => (
              <div key={t.text} style={{ display: 'flex', gap: '12px',
                alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ color: '#4a7c59', fontSize: '14px', flexShrink: 0 }}>{t.icon}</span>
                <span style={{ fontSize: '13px', color: '#8fad7c', lineHeight: '1.5' }}>{t.text}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#141710', borderRadius: '12px',
            padding: '20px', border: '1px solid #252b1f' }}>
            <div style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace",
              color: '#6db882', letterSpacing: '1.5px', marginBottom: '12px' }}>
              ✅ SYSTEM STATUS
            </div>
            <p style={{ fontSize: '13px', color: '#8fad7c', lineHeight: '1.8' }}>
              Backend API ✅ &nbsp;·&nbsp; Database ✅<br/>
              Auth ✅ &nbsp;·&nbsp; Session tracking ✅<br/>
              Streak system ✅ &nbsp;·&nbsp; Stats API ✅
            </p>
            <p style={{ fontSize: '12px', color: '#5a6355', marginTop: '8px' }}>
              Logged in as <strong style={{ color: '#e8e0cc' }}>{email}</strong>
            </p>
          </div>
        </div>

        {/* Right — Pomodoro Timer */}
        <div style={{ padding: '32px 24px', background: '#0e110c',
          display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace",
            color: '#5a6355', letterSpacing: '1.5px', marginBottom: '24px' }}>
            POMODORO TIMER
          </div>
          <Suspense fallback={<div style={{ color: '#5a6355' }}>Loading timer...</div>}>
            <PomodoroTimer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
// Notes navigation already handled by router in notes page

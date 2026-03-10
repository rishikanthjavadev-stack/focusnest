'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const PomodoroTimer = dynamic(() => import('@/components/PomodoroTimer'), { ssr: false });

export default function TimerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }
    setReady(true);
  }, [router]);

  if (!ready) return (
    <div style={{ minHeight:'100vh', background:'#0c0f0a',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>🪺</div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0c0f0a',
      fontFamily:"'Outfit', sans-serif", color:'#e8e0cc' }}>

      {/* Header */}
      <div style={{ padding:'28px 32px 0' }}>
        <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
          color:'#5a6355', letterSpacing:'1.5px', marginBottom:'6px' }}>
          POMODORO TIMER
        </div>
        <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:'26px',
          fontWeight:'700', color:'#e8e0cc', marginBottom:'4px' }}>
          Focus Session
        </h1>
        <p style={{ fontSize:'13px', color:'#5a6355' }}>
          Build deep work habits — one session at a time.
        </p>
      </div>

      {/* Timer centered */}
      <div style={{ display:'flex', justifyContent:'center',
        padding:'40px 32px' }}>
        <div style={{ width:'100%', maxWidth:'480px',
          background:'#141710', borderRadius:'20px', padding:'36px',
          border:'1px solid #252b1f' }}>
          <Suspense fallback={<div style={{ color:'#5a6355', textAlign:'center' }}>Loading timer...</div>}>
            <PomodoroTimer />
          </Suspense>
        </div>
      </div>

      {/* Tips */}
      <div style={{ padding:'0 32px 32px', maxWidth:'560px' }}>
        <div style={{ background:'#141710', borderRadius:'14px', padding:'20px',
          border:'1px solid #252b1f' }}>
          <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
            color:'#6db882', letterSpacing:'1.5px', marginBottom:'14px' }}>
            🪺 POMODORO TECHNIQUE
          </div>
          {[
            { icon:'▶', text:'25 min of deep focused work' },
            { icon:'☕', text:'5 min break to recharge' },
            { icon:'🔄', text:'After 4 sessions — take a 15 min long break' },
            { icon:'🔥', text:'Each completed session builds your streak' },
          ].map(t => (
            <div key={t.text} style={{ display:'flex', gap:'12px',
              alignItems:'flex-start', marginBottom:'10px' }}>
              <span style={{ color:'#4a7c59', fontSize:'14px', flexShrink:0 }}>{t.icon}</span>
              <span style={{ fontSize:'13px', color:'#8fad7c', lineHeight:'1.5' }}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

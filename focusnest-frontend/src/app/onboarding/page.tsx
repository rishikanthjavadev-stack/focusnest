'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const SKILLS = ['Machine Learning','Deep Learning','Web Development','Data Science',
  'Python','JavaScript','System Design','Cloud Computing','DevOps','Cybersecurity',
  'UI/UX Design','Product Management','Research Methods','Statistics','Mathematics'];

const SLOTS = ['Early Morning (5–8 AM)','Morning (8–11 AM)','Afternoon (12–3 PM)',
  'Evening (4–7 PM)','Night (8–11 PM)','Late Night (11 PM+)'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [role, setRole]       = useState('');
  const [skills, setSkills]   = useState<string[]>([]);
  const [dailyTime, setDailyTime] = useState(60);
  const [slots, setSlots]     = useState<string[]>([]);

  useEffect(() => {
    const existing = localStorage.getItem('fn_onboarding');
    if (existing) { router.replace('/dashboard'); return; }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      fetch('http://localhost:8080/api/auth/token/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.accessToken) {
          localStorage.setItem('fn_access', data.accessToken);
          localStorage.setItem('fn_refresh', data.refreshToken);
          window.history.replaceState({}, '', '/onboarding');
        } else {
          router.replace('/login');
        }
      })
      .catch(() => router.replace('/login'));
      return;
    }

    const token = localStorage.getItem('fn_access');
    if (!token) { router.replace('/login'); }
  }, [router]);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const canNext = [role !== '', skills.length > 0, slots.length > 0];

  const finish = async () => {
    localStorage.setItem('fn_onboarding', JSON.stringify({ role, skills, dailyTime, slots }));
    try {
      await api.patch('/users/me/onboarding');
    } catch (e) {
      console.error('Failed to mark onboarding done', e);
    }
    router.push('/dashboard');
  };

  const chip = (active: boolean, color: string) => ({
    padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px',
    fontWeight: active ? '700' : '500', border: `1.5px solid ${active ? color : '#252b1f'}`,
    background: active ? color + '22' : '#141710', color: active ? color : '#5a6355',
  } as React.CSSProperties);

  return (
    <div style={{ minHeight: '100vh', background: '#0c0f0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
      fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px',
              background: i <= step ? '#4a7c59' : '#252b1f', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px',
            background: 'linear-gradient(135deg,#4a7c59,#8fad7c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🪺</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: '700', color: '#e8e0cc' }}>FocusNest</div>
        </div>
        <div style={{ background: '#141710', borderRadius: '16px', padding: '28px',
          border: '1px solid #252b1f', marginBottom: '16px' }}>
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: '700', color: '#e8e0cc', marginBottom: '4px' }}>
                Welcome to <em style={{ color: '#6db882' }}>FocusNest</em>
              </h2>
              <p style={{ fontSize: '13px', color: '#5a6355', marginBottom: '22px' }}>Just 3 quick questions — then you&apos;re in!</p>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: '#5a6355', fontFamily: "'DM Mono',monospace", marginBottom: '10px' }}>I AM A</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['Student','Researcher','Working Professional','Freelancer'].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    style={{ ...chip(role === r, '#4a7c59'), padding: '12px', borderRadius: '10px' }}>
                    {role === r ? '✦ ' : ''}{r}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: '700', color: '#e8e0cc', marginBottom: '4px' }}>What will you learn?</h2>
              <p style={{ fontSize: '13px', color: '#5a6355', marginBottom: '18px' }}>Pick all skills you want to develop.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', maxHeight: '280px', overflowY: 'auto' }}>
                {SKILLS.map(s => (
                  <button key={s} onClick={() => toggle(skills, s, setSkills)} style={chip(skills.includes(s), '#4a7c59')}>
                    {skills.includes(s) ? '✦ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: '700', color: '#e8e0cc', marginBottom: '4px' }}>Plan your nest time</h2>
              <p style={{ fontSize: '13px', color: '#5a6355', marginBottom: '18px' }}>Set your daily goal and preferred slots.</p>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: '#5a6355', fontFamily: "'DM Mono',monospace", marginBottom: '8px' }}>DAILY GOAL</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '18px' }}>
                {[30,45,60,90,120,180].map(t => (
                  <button key={t} onClick={() => setDailyTime(t)} style={chip(dailyTime === t, '#d4872a')}>
                    {t >= 60 ? `${t/60}h` : `${t}m`}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: '#5a6355', fontFamily: "'DM Mono',monospace", marginBottom: '8px' }}>STUDY SLOTS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {SLOTS.map(s => (
                  <button key={s} onClick={() => toggle(slots, s, setSlots)}
                    style={{ ...chip(slots.includes(s), '#8fad7c'), textAlign: 'left', padding: '10px 14px', borderRadius: '9px' }}>
                    {slots.includes(s) ? '◆ ' : '◇ '}{s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, padding: '13px', borderRadius: '10px', background: '#141710',
                border: '1px solid #252b1f', color: '#5a6355', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              ← Back
            </button>
          )}
          <button onClick={() => step < 2 ? setStep(s => s + 1) : finish()} disabled={!canNext[step]}
            style={{ flex: 2, padding: '13px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700',
              cursor: canNext[step] ? 'pointer' : 'not-allowed',
              background: canNext[step] ? 'linear-gradient(135deg,#4a7c59,#8fad7c)' : '#2a3025',
              color: canNext[step] ? '#0c0f0a' : '#5a6355' }}>
            {step < 2 ? 'Continue →' : '🪺 Enter FocusNest'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/services/api';

const MODES = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
};

function Ring({ seconds, total, size = 180, stroke = 10, color = '#4a7c59' }: {
  seconds: number; total: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, (total - seconds) / total);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1e16" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
}

export default function PomodoroTimer() {
  const [mode, setMode]       = useState<'work'|'short'|'long'>('work');
  const [seconds, setSeconds] = useState(MODES.work);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [todaySecs, setTodaySecs] = useState(0);
  const [streak, setStreak]   = useState(0);
  const [sessions, setSessions] = useState(0);
  const [dailyGoal] = useState(60 * 60); // 1 hour default
  const [toast, setToast]     = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load stats on mount
  useEffect(() => {
    api.get('/sessions/stats').then(({ data }) => {
      setTodaySecs(data.todaySeconds || 0);
      setStreak(data.streakDays || 0);
      setSessions(data.todaySessions || 0);
    }).catch(() => {});
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleStart = async () => {
    try {
      const { data } = await api.post('/sessions/start', { sessionType: mode === 'work' ? 'FOCUS' : 'BREAK' });
      setSessionId(data.id);
      setRunning(true);
    } catch {
      // Fallback — run timer without backend
      setRunning(true);
    }
  };

  const handleComplete = useCallback(async () => {
    const elapsed = MODES[mode] ;
    if (sessionId) {
      try {
        await api.post(`/sessions/${sessionId}/complete`, { durationSeconds: elapsed });
        const { data } = await api.get('/sessions/stats');
        setTodaySecs(data.todaySeconds || 0);
        setStreak(data.streakDays || 0);
        setSessions(data.todaySessions || 0);
      } catch {}
    }
    if (mode === 'work') {
      setTodaySecs(p => p + elapsed);
      setSessions(p => p + 1);
      showToast('🎉 Focus session complete! Take a break.');
      setMode('short');
      setSeconds(MODES.short);
    } else {
      showToast('⏰ Break over! Ready to focus?');
      setMode('work');
      setSeconds(MODES.work);
    }
    setSessionId(null);
  }, [mode, sessionId, showToast]);

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setSeconds(MODES[mode]);
    setSessionId(null);
  };

  const switchMode = (m: 'work'|'short'|'long') => {
    setRunning(false);
    setMode(m);
    setSeconds(MODES[m]);
    setSessionId(null);
  };

  const todayPct  = Math.min(100, Math.round((todaySecs / dailyGoal) * 100));
  const ringColor = mode === 'work' ? '#4a7c59' : '#d4872a';

  const fmt2 = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: '#e8e0cc' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#1a1e16', border: `1px solid #4a7c59`,
          borderRadius: '12px', padding: '14px 20px', fontSize: '14px',
          fontWeight: '600', boxShadow: '0 0 30px #4a7c5933',
          animation: 'slideIn 0.3s ease' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '440px', margin: '0 auto' }}>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px',
          background: '#141710', borderRadius: '12px', padding: '6px' }}>
          {([['work','Focus','25m'],['short','Short Break','5m'],['long','Long Break','15m']] as const).map(([m, label, time]) => (
            <button key={m} onClick={() => switchMode(m)}
              style={{ flex: 1, padding: '9px 6px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: mode === m ? '700' : '500',
                background: mode === m ? (m === 'work' ? '#4a7c5933' : '#d4872a33') : 'transparent',
                color: mode === m ? (m === 'work' ? '#6db882' : '#d4872a') : '#5a6355',
                transition: 'all 0.2s', lineHeight: '1.4' }}>
              {label}<br/>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{time}</span>
            </button>
          ))}
        </div>

        {/* Ring timer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px',
          position: 'relative' }}>
          <Ring seconds={seconds} total={MODES[mode]} size={210} stroke={11} color={ringColor} />
          <div style={{ position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '48px',
              fontWeight: '500', letterSpacing: '-3px', color: ringColor,
              lineHeight: 1 }}>
              {fmt(seconds)}
            </div>
            <div style={{ fontSize: '11px', color: '#5a6355', marginTop: '6px',
              letterSpacing: '2px', fontFamily: "'DM Mono', monospace" }}>
              {mode === 'work' ? 'FOCUS' : 'BREAK'}
            </div>
            {running && (
              <div style={{ fontSize: '10px', color: ringColor, marginTop: '4px',
                animation: 'pulse 1.5s ease-in-out infinite' }}>● LIVE</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button onClick={running ? handlePause : handleStart}
            style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
              cursor: 'pointer', fontSize: '15px', fontWeight: '700', transition: 'all 0.2s',
              background: running ? '#c0392b22' : `linear-gradient(135deg, ${ringColor}, #8fad7c)`,
              color: running ? '#e74c3c' : '#0c0f0a',
              boxShadow: running ? 'none' : `0 0 20px ${ringColor}44` }}>
            {running ? '⏸ Pause' : sessionId ? '▶ Resume' : '▶ Start'}
          </button>
          <button onClick={handleReset}
            style={{ flex: 1, padding: '14px', borderRadius: '12px',
              border: '1px solid #252b1f', background: '#141710',
              color: '#5a6355', cursor: 'pointer', fontSize: '16px' }}>
            ↺
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px', marginBottom: '20px' }}>
          {[
            { label: "Today", value: fmt2(todaySecs), color: '#6db882' },
            { label: "Sessions", value: String(sessions), color: '#8fad7c' },
            { label: "Streak", value: `${streak}d 🔥`, color: '#d4872a' },
          ].map(s => (
            <div key={s.label} style={{ background: '#141710', borderRadius: '10px',
              padding: '12px', border: '1px solid #252b1f', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px',
                fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: '#5a6355', marginTop: '3px',
                fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Daily goal progress */}
        <div style={{ background: '#141710', borderRadius: '12px',
          padding: '16px', border: '1px solid #252b1f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: '11px', marginBottom: '8px' }}>
            <span style={{ color: '#5a6355', fontFamily: "'DM Mono', monospace",
              letterSpacing: '1px' }}>DAILY GOAL</span>
            <span style={{ color: '#6db882', fontWeight: '700' }}>{todayPct}%</span>
          </div>
          <div style={{ height: '6px', background: '#252b1f', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${todayPct}%`, background: '#4a7c59',
              borderRadius: '3px', transition: 'width 0.6s ease',
              boxShadow: todayPct > 0 ? '0 0 8px #4a7c5988' : 'none' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#5a6355', marginTop: '6px',
            fontFamily: "'DM Mono', monospace" }}>
            {fmt2(todaySecs)} / 1h goal
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}

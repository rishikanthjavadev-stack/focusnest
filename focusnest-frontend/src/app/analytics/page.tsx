'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface DayData { day: string; date: string; seconds: number; sessions: number; }
interface Analytics {
  weeklyData: DayData[];
  totalWeekSeconds: number; totalWeekSessions: number;
  streakDays: number; todaySeconds: number;
  avgSessionMinutes: number; bestDay: string; bestDaySeconds: number;
}

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c', amber:'#d4872a',
  muted:'#5a6355', cream:'#e8e0cc', blue:'#4a9ead',
};

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData]     = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hover, setHover]   = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }
    api.get('/analytics/weekly')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex',
      alignItems:'center', justifyContent:'center', fontSize:'32px' }}>🪺</div>
  );

  const maxSecs = data?.weeklyData?.length ? Math.max(...data.weeklyData.map(d => d.seconds), 1) : 1;
  const weekGoal = 7 * 3600; // 7h per week
  const weekPct  = data ? Math.min(100, Math.round((data.totalWeekSeconds / weekGoal) * 100)) : 0;

  const statCard = (icon: string, label: string, value: string, color: string, sub?: string) => (
    <div style={{ background:C.card, borderRadius:'14px', padding:'20px',
      border:`1px solid ${C.border}` }}>
      <div style={{ fontSize:'22px', marginBottom:'10px' }}>{icon}</div>
      <div style={{ fontFamily:"'Fraunces', serif", fontSize:'26px',
        fontWeight:'700', color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'11px', color:C.muted, marginTop:'5px',
        fontFamily:"'DM Mono', monospace", letterSpacing:'1px' }}>{label}</div>
      {sub && <div style={{ fontSize:'11px', color:C.muted, marginTop:'3px' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg,
      fontFamily:"'Outfit', sans-serif", color:C.cream }}>

      {/* Top bar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:'14px 28px', display:'flex', alignItems:'center', gap:'16px' }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:'18px' }}>←</button>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'7px',
            background:`linear-gradient(135deg,${C.nest},${C.sage})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>🪺</div>
          <span style={{ fontFamily:"'Fraunces', serif", fontSize:'15px', fontWeight:'700' }}>FocusNest</span>
        </div>
        <span style={{ color:C.muted, fontSize:'13px' }}>/ Analytics</span>
        <div style={{ marginLeft:'auto', fontSize:'11px', color:C.muted,
          fontFamily:"'DM Mono', monospace" }}>LAST 7 DAYS</div>
      </div>

      <div style={{ padding:'28px', maxWidth:'1100px', margin:'0 auto' }}>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
          gap:'14px', marginBottom:'28px' }}>
          {data && <>
            {statCard('⏱', 'WEEK TOTAL',    fmt(data.totalWeekSeconds), C.nestGlow,
              `${weekPct}% of 7h goal`)}
            {statCard('🎯', 'TODAY',         fmt(data.todaySeconds),     C.sage)}
            {statCard('✅', 'SESSIONS',      String(data.totalWeekSessions), C.blue,
              'this week')}
            {statCard('⚡', 'AVG SESSION',   `${data.avgSessionMinutes}m`, C.amber,
              'per session')}
            {statCard('🔥', 'STREAK',        `${data.streakDays} days`,  '#e67e22')}
            {statCard('🏆', 'BEST DAY',
              data.bestDay || '—',
              C.nestGlow,
              data.bestDay ? fmt(data.bestDaySeconds) : 'No sessions yet')}
          </>}
        </div>

        {/* Bar chart */}
        <div style={{ background:C.card, borderRadius:'16px', padding:'24px',
          border:`1px solid ${C.border}`, marginBottom:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:'24px' }}>
            <div>
              <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
                color:C.muted, letterSpacing:'1.5px', marginBottom:'4px' }}>
                STUDY TIME — LAST 7 DAYS
              </div>
              <div style={{ fontFamily:"'Fraunces', serif", fontSize:'20px',
                fontWeight:'700', color:C.cream }}>
                {data ? fmt(data.totalWeekSeconds) : '0m'} this week
              </div>
            </div>
            {/* Week goal bar */}
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'11px', color:C.muted, marginBottom:'6px',
                fontFamily:"'DM Mono', monospace" }}>WEEK GOAL {weekPct}%</div>
              <div style={{ width:'120px', height:'6px', background:C.border,
                borderRadius:'3px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${weekPct}%`, background:C.nest,
                  borderRadius:'3px', transition:'width 0.6s ease',
                  boxShadow: weekPct > 0 ? `0 0 8px ${C.nest}88` : 'none' }} />
              </div>
            </div>
          </div>

          {/* Bars */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:'10px', height:'180px' }}>
            {data?.weeklyData?.map((d, i) => {
              const pct    = d.seconds / maxSecs;
              const barH   = Math.max(pct * 150, d.seconds > 0 ? 8 : 3);
              const isToday = i === 6;
              const isHover = hover === i;
              return (
                <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column',
                  alignItems:'center', gap:'8px', position:'relative' }}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>

                  {/* Tooltip */}
                  {isHover && d.seconds > 0 && (
                    <div style={{ position:'absolute', bottom:'100%', left:'50%',
                      transform:'translateX(-50%)', background:C.surface,
                      border:`1px solid ${C.border}`, borderRadius:'8px',
                      padding:'8px 12px', fontSize:'11px', whiteSpace:'nowrap',
                      zIndex:10, boxShadow:'0 4px 16px #00000066', marginBottom:'6px' }}>
                      <div style={{ fontWeight:'700', color:C.cream }}>{fmt(d.seconds)}</div>
                      <div style={{ color:C.muted }}>{d.sessions} session{d.sessions!==1?'s':''}</div>
                      <div style={{ color:C.muted }}>{d.date}</div>
                    </div>
                  )}

                  {/* Bar */}
                  <div style={{ width:'100%', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'flex-end', height:'150px' }}>
                    <div style={{
                      width: isHover ? '80%' : '65%',
                      height: `${barH}px`,
                      borderRadius:'6px 6px 3px 3px',
                      background: isToday
                        ? `linear-gradient(180deg, ${C.nestGlow}, ${C.nest})`
                        : isHover
                        ? `linear-gradient(180deg, ${C.sage}, ${C.nest}88)`
                        : d.seconds > 0 ? C.nest+'88' : C.border,
                      transition:'all 0.2s ease',
                      boxShadow: isToday && d.seconds > 0 ? `0 0 12px ${C.nest}66` : 'none',
                    }} />
                  </div>

                  {/* Label */}
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'11px', fontWeight: isToday?'700':'500',
                      color: isToday ? C.nestGlow : C.muted,
                      fontFamily:"'DM Mono', monospace" }}>{d.day}</div>
                    {d.seconds > 0 && (
                      <div style={{ fontSize:'9px', color:C.muted, marginTop:'2px' }}>
                        {fmt(d.seconds)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

          {/* Session breakdown */}
          <div style={{ background:C.card, borderRadius:'16px', padding:'22px',
            border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
              color:C.muted, letterSpacing:'1.5px', marginBottom:'18px' }}>
              DAILY BREAKDOWN
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {data?.weeklyData?.map((d, i) => {
                const pct = d.seconds / maxSecs;
                const isToday = i === 6;
                return (
                  <div key={d.day} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'32px', fontSize:'11px', fontWeight: isToday?'700':'500',
                      color: isToday?C.nestGlow:C.muted,
                      fontFamily:"'DM Mono', monospace", flexShrink:0 }}>{d.day}</div>
                    <div style={{ flex:1, height:'6px', background:C.border,
                      borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct*100}%`,
                        background: isToday ? C.nest : C.nest+'77',
                        borderRadius:'3px', transition:'width 0.6s ease' }} />
                    </div>
                    <div style={{ width:'36px', fontSize:'11px', color:C.muted, textAlign:'right',
                      fontFamily:"'DM Mono', monospace" }}>
                      {d.seconds > 0 ? fmt(d.seconds) : '—'}
                    </div>
                    <div style={{ width:'16px', fontSize:'10px', color:C.muted, textAlign:'right' }}>
                      {d.sessions > 0 ? `×${d.sessions}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div style={{ background:C.card, borderRadius:'16px', padding:'22px',
            border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
              color:C.muted, letterSpacing:'1.5px', marginBottom:'18px' }}>
              🪺 INSIGHTS
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {data && [
                {
                  icon: data.streakDays >= 3 ? '🔥' : '💡',
                  text: data.streakDays >= 3
                    ? `${data.streakDays}-day streak! Keep it up.`
                    : 'Start a daily streak — study for 3+ days in a row!',
                  color: data.streakDays >= 3 ? C.amber : C.muted,
                },
                {
                  icon: data.totalWeekSessions >= 5 ? '✅' : '🎯',
                  text: data.totalWeekSessions >= 5
                    ? `Great week — ${data.totalWeekSessions} sessions completed!`
                    : `${Math.max(0, 5 - data.totalWeekSessions)} more sessions to hit your weekly target.`,
                  color: data.totalWeekSessions >= 5 ? C.nestGlow : C.muted,
                },
                {
                  icon: weekPct >= 100 ? '🏆' : '📈',
                  text: weekPct >= 100
                    ? 'Weekly goal smashed! 🎉'
                    : `${fmt(Math.max(0, weekGoal - data.totalWeekSeconds))} left to hit your 7h weekly goal.`,
                  color: weekPct >= 100 ? C.amber : C.muted,
                },
                {
                  icon: data.avgSessionMinutes >= 20 ? '⚡' : '⏱',
                  text: data.avgSessionMinutes >= 20
                    ? `Strong avg session: ${data.avgSessionMinutes}min — deep work!`
                    : data.avgSessionMinutes > 0
                    ? `Avg session ${data.avgSessionMinutes}min — try to hit 25min focus blocks.`
                    : 'Start your first Pomodoro session today!',
                  color: data.avgSessionMinutes >= 20 ? C.sage : C.muted,
                },
              ].map((ins, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'16px', flexShrink:0 }}>{ins.icon}</span>
                  <span style={{ fontSize:'13px', color:ins.color, lineHeight:'1.5' }}>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

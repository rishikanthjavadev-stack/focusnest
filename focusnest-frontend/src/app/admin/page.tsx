'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c', amber:'#d4872a',
  muted:'#5a6355', cream:'#e8e0cc', red:'#e74c3c', purple:'#9b59b6',
  blue:'#3498db', teal:'#1abc9c',
};

interface AdminUser {
  id: number; name: string; email: string; role: string;
  isAdmin: boolean; streakCount: number; lastStudyDate: string;
  createdAt: string; totalSessions: number; totalNotes: number;
  totalStudySeconds: number;
}

const fmtHours = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const fmtDate = (d: string) => d
  ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
  : '—';

const fmtMoney = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

// Simulated pricing tiers
const PLANS = { FREE: 0, PRO: 9.99, TEAM: 29.99 };

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [stats, setStats]     = useState<Record<string,number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [toast, setToast]     = useState('');
  const [toastOk, setToastOk] = useState(true);
  const [tab, setTab]         = useState<'revenue'|'users'|'engagement'>('revenue');
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast(msg); setToastOk(ok); setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }
    fetchAll();
  }, [router]);

  const fetchAll = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setStats(statsRes.data);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err.response?.status === 403 || err.response?.status === 401) {
        showToast('⛔ Access denied — admins only', false);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        showToast('Failed to load admin data', false);
      }
    } finally { setLoading(false); }
  };

  const handleToggleAdmin = async (user: AdminUser) => {
    try {
      await api.put(`/admin/users/${user.id}/toggle-admin`);
      setUsers(us => us.map(u => u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u));
      if (selected?.id === user.id) setSelected(s => s ? { ...s, isAdmin: !s.isAdmin } : s);
      showToast(`✅ Admin ${user.isAdmin ? 'removed' : 'granted'} for ${user.name}`);
    } catch { showToast('Failed', false); }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers(us => us.filter(u => u.id !== user.id));
      if (selected?.id === user.id) setSelected(null);
      showToast(`🗑 ${user.name} deleted`);
    } catch { showToast('Failed to delete', false); }
  };

  // ── Derived revenue metrics ──────────────────────────────────
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo  = new Date(now.getTime() - 7  * 86400000);

  const activeUsers   = users.filter(u => u.lastStudyDate && new Date(u.lastStudyDate) > thirtyDaysAgo);
  const newThisMonth  = users.filter(u => u.createdAt && new Date(u.createdAt) > thirtyDaysAgo);
  const newThisWeek   = users.filter(u => u.createdAt && new Date(u.createdAt) > sevenDaysAgo);
  const powerUsers    = users.filter(u => u.totalSessions >= 10);
  const churnRisk     = users.filter(u => !u.lastStudyDate || new Date(u.lastStudyDate) < thirtyDaysAgo);

  // Simulated revenue — power users = PRO, others = FREE
  const proUsers      = powerUsers.length;
  const freeUsers     = users.length - proUsers;
  const mrr           = proUsers * PLANS.PRO;
  const arr           = mrr * 12;
  const avgRevPerUser = users.length > 0 ? mrr / users.length : 0;
  const engagementRate= users.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0;

  // Signup trend — last 7 days
  const signupTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const label = d.toLocaleDateString('en-US', { weekday:'short' });
    const count = users.filter(u => {
      if (!u.createdAt) return false;
      const ud = new Date(u.createdAt);
      return ud.toDateString() === d.toDateString();
    }).length;
    return { label, count };
  });

  const maxSignups = Math.max(...signupTrend.map(d => d.count), 1);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Metric card ──────────────────────────────────────────────
  const MetricCard = ({ label, value, sub, icon, color, border: bc }: {
    label: string; value: string; sub?: string;
    icon: string; color: string; border?: string;
  }) => (
    <div style={{ background:C.card, borderRadius:'14px', padding:'20px',
      border:`1px solid ${bc || C.border}`, flex:1, minWidth:'140px' }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:'12px' }}>
        <div style={{ fontSize:'20px' }}>{icon}</div>
        {sub && <div style={{ fontSize:'10px', color:C.muted,
          fontFamily:"'DM Mono', monospace", background:C.surface,
          padding:'2px 7px', borderRadius:'20px' }}>{sub}</div>}
      </div>
      <div style={{ fontFamily:"'Fraunces', serif", fontSize:'28px',
        fontWeight:'700', color, marginBottom:'4px', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
        color:C.muted, letterSpacing:'1px' }}>{label}</div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>🪺</div>
        <div style={{ color:C.muted, fontFamily:"'DM Mono', monospace",
          fontSize:'12px' }}>Loading admin data...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg,
      fontFamily:"'Outfit', sans-serif", color:C.cream }}>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999,
          background:C.card, border:`1px solid ${toastOk ? C.nest : C.red}`,
          borderRadius:'12px', padding:'13px 18px', fontSize:'13px',
          fontWeight:'600', boxShadow:`0 0 24px ${toastOk ? C.nest : C.red}33` }}>
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:'0 28px', display:'flex', alignItems:'center',
        justifyContent:'space-between', height:'52px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'16px' }}>👑</span>
            <span style={{ fontFamily:"'Fraunces', serif", fontSize:'16px',
              fontWeight:'700', color:C.cream }}>Admin</span>
            <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px',
              background:C.purple+'22', color:C.purple, border:`1px solid ${C.purple}33`,
              fontFamily:"'DM Mono', monospace" }}>FOCUSNEST</span>
          </div>
          <div style={{ display:'flex', gap:'2px' }}>
            {(['revenue','users','engagement'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:'6px 16px', borderRadius:'8px', border:'none',
                  background: tab === t ? C.purple+'33' : 'transparent',
                  color: tab === t ? '#c39bd3' : C.muted, cursor:'pointer',
                  fontSize:'11px', fontWeight:'700',
                  fontFamily:"'DM Mono', monospace", letterSpacing:'1px',
                  transition:'all 0.15s' }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ fontSize:'11px', color:C.muted,
            fontFamily:"'DM Mono', monospace" }}>
            {users.length} users · MRR {fmtMoney(mrr)}
          </div>
          <button onClick={() => router.push('/dashboard')}
            style={{ padding:'6px 14px', borderRadius:'8px',
              border:`1px solid ${C.border}`, background:'transparent',
              color:C.muted, cursor:'pointer', fontSize:'12px' }}>← App</button>
        </div>
      </div>

      <div style={{ padding:'24px 28px' }}>

        {/* ── REVENUE TAB ───────────────────────────── */}
        {tab === 'revenue' && (
          <div>
            {/* Revenue metric cards */}
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
              <MetricCard label="MONTHLY RECURRING REVENUE" value={fmtMoney(mrr)}
                icon="💰" color={C.nestGlow} border={C.nest+'44'} sub="MRR" />
              <MetricCard label="ANNUAL RUN RATE" value={fmtMoney(arr)}
                icon="📈" color={C.amber} sub="ARR" />
              <MetricCard label="AVG REVENUE / USER" value={fmtMoney(avgRevPerUser)}
                icon="👤" color={C.sage} sub="ARPU" />
              <MetricCard label="PRO SUBSCRIBERS" value={String(proUsers)}
                icon="⭐" color={C.purple} sub={`of ${users.length}`} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>

              {/* Signup trend chart */}
              <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
                border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
                  color:C.muted, letterSpacing:'1.5px', marginBottom:'6px' }}>
                  📅 NEW SIGNUPS — LAST 7 DAYS
                </div>
                <div style={{ fontSize:'22px', fontFamily:"'Fraunces', serif",
                  fontWeight:'700', color:C.cream, marginBottom:'16px' }}>
                  +{newThisWeek.length} this week
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'80px' }}>
                  {signupTrend.map(({ label, count }) => (
                    <div key={label} style={{ flex:1, display:'flex',
                      flexDirection:'column', alignItems:'center', gap:'4px' }}>
                      <div style={{ width:'100%', borderRadius:'4px 4px 0 0',
                        background: count > 0
                          ? `linear-gradient(180deg,${C.nestGlow},${C.nest})`
                          : C.border,
                        height:`${Math.max((count / maxSignups) * 60, count > 0 ? 8 : 2)}px`,
                        transition:'height 0.3s', minHeight:'2px' }} />
                      <div style={{ fontSize:'9px', color:C.muted,
                        fontFamily:"'DM Mono', monospace" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue breakdown */}
              <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
                border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
                  color:C.muted, letterSpacing:'1.5px', marginBottom:'16px' }}>
                  💳 PLAN BREAKDOWN
                </div>
                {[
                  { plan:'PRO', count:proUsers,  price:PLANS.PRO,  color:C.purple, icon:'⭐' },
                  { plan:'FREE', count:freeUsers, price:PLANS.FREE, color:C.muted,  icon:'🆓' },
                ].map(({ plan, count, price, color, icon }) => (
                  <div key={plan} style={{ marginBottom:'14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      marginBottom:'6px' }}>
                      <span style={{ fontSize:'13px', color, fontWeight:'600' }}>
                        {icon} {plan} · {count} users
                      </span>
                      <span style={{ fontSize:'13px', color,
                        fontFamily:"'DM Mono', monospace", fontWeight:'700' }}>
                        {fmtMoney(count * price)}/mo
                      </span>
                    </div>
                    <div style={{ height:'6px', borderRadius:'3px', background:C.border }}>
                      <div style={{ height:'100%', borderRadius:'3px', background:color,
                        width:`${users.length > 0 ? (count / users.length) * 100 : 0}%`,
                        transition:'width 0.5s' }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:'16px', padding:'12px',
                  background:C.surface, borderRadius:'10px',
                  border:`1px solid ${C.nest}33` }}>
                  <div style={{ fontSize:'10px', color:C.muted, marginBottom:'4px',
                    fontFamily:"'DM Mono', monospace" }}>CONVERSION RATE</div>
                  <div style={{ fontSize:'22px', fontFamily:"'Fraunces', serif",
                    fontWeight:'700', color:C.nestGlow }}>
                    {users.length > 0 ? Math.round((proUsers / users.length) * 100) : 0}%
                  </div>
                  <div style={{ fontSize:'11px', color:C.muted }}>free → pro</div>
                </div>
              </div>
            </div>

            {/* Churn risk + growth opportunities */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
                border:`1px solid ${C.red}33` }}>
                <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
                  color:C.red, letterSpacing:'1.5px', marginBottom:'12px' }}>
                  ⚠️ CHURN RISK — {churnRisk.length} USERS
                </div>
                <div style={{ fontSize:'12px', color:C.muted, marginBottom:'12px' }}>
                  Inactive for 30+ days
                </div>
                {churnRisk.slice(0,4).map(u => (
                  <div key={u.id} style={{ display:'flex', alignItems:'center',
                    gap:'10px', padding:'8px 0',
                    borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'7px',
                      background:C.red+'22', display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'12px', fontWeight:'700',
                      color:C.red }}>
                      {u.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'12px', fontWeight:'600' }}>{u.name}</div>
                      <div style={{ fontSize:'10px', color:C.muted }}>
                        {u.lastStudyDate ? `Last active ${fmtDate(u.lastStudyDate)}` : 'Never studied'}
                      </div>
                    </div>
                    <div style={{ fontSize:'10px', color:C.red,
                      fontFamily:"'DM Mono', monospace" }}>AT RISK</div>
                  </div>
                ))}
                {churnRisk.length === 0 &&
                  <div style={{ color:C.nestGlow, fontSize:'13px' }}>✅ No churn risk!</div>}
              </div>

              <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
                border:`1px solid ${C.amber}33` }}>
                <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
                  color:C.amber, letterSpacing:'1.5px', marginBottom:'12px' }}>
                  🚀 UPSELL OPPORTUNITIES
                </div>
                <div style={{ fontSize:'12px', color:C.muted, marginBottom:'12px' }}>
                  Active free users ready to upgrade
                </div>
                {activeUsers.filter(u => !powerUsers.includes(u)).slice(0,4).map(u => (
                  <div key={u.id} style={{ display:'flex', alignItems:'center',
                    gap:'10px', padding:'8px 0',
                    borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'7px',
                      background:C.amber+'22', display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'12px', fontWeight:'700',
                      color:C.amber }}>
                      {u.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'12px', fontWeight:'600' }}>{u.name}</div>
                      <div style={{ fontSize:'10px', color:C.muted }}>
                        {u.totalSessions} sessions · {fmtHours(u.totalStudySeconds)}
                      </div>
                    </div>
                    <div style={{ fontSize:'10px', color:C.amber,
                      fontFamily:"'DM Mono', monospace" }}>FREE</div>
                  </div>
                ))}
                {activeUsers.filter(u => !powerUsers.includes(u)).length === 0 &&
                  <div style={{ color:C.nestGlow, fontSize:'13px' }}>
                    ✅ All active users are PRO!
                  </div>}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ─────────────────────────────── */}
        {tab === 'users' && (
          <div style={{ display:'grid',
            gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap:'16px' }}>
            <div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search users..."
                style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`,
                  borderRadius:'10px', padding:'11px 14px', color:C.cream,
                  fontSize:'13px', outline:'none', marginBottom:'16px',
                  fontFamily:"'Outfit', sans-serif", boxSizing:'border-box' }} />
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {filtered.map(user => {
                  const isPro = user.totalSessions >= 10;
                  return (
                    <div key={user.id}
                      onClick={() => setSelected(s => s?.id === user.id ? null : user)}
                      style={{ background: selected?.id === user.id ? C.purple+'11' : C.card,
                        borderRadius:'12px', padding:'14px 18px',
                        border:`1px solid ${selected?.id === user.id ? C.purple+'55' : C.border}`,
                        cursor:'pointer', display:'flex', alignItems:'center',
                        gap:'14px', transition:'all 0.15s' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'10px',
                        flexShrink:0, background: user.isAdmin
                          ? `linear-gradient(135deg,${C.purple},#c39bd3)`
                          : isPro
                            ? `linear-gradient(135deg,${C.amber},#f39c12)`
                            : `linear-gradient(135deg,${C.nest},${C.sage})`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'16px', fontWeight:'700', color:C.bg }}>
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center',
                          gap:'7px', marginBottom:'3px' }}>
                          <span style={{ fontSize:'14px', fontWeight:'700' }}>{user.name}</span>
                          {user.isAdmin && <span style={{ fontSize:'9px', padding:'1px 6px',
                            borderRadius:'20px', background:C.purple+'22', color:C.purple,
                            fontFamily:"'DM Mono', monospace" }}>ADMIN</span>}
                          {isPro && <span style={{ fontSize:'9px', padding:'1px 6px',
                            borderRadius:'20px', background:C.amber+'22', color:C.amber,
                            fontFamily:"'DM Mono', monospace" }}>PRO</span>}
                        </div>
                        <div style={{ fontSize:'11px', color:C.muted,
                          overflow:'hidden', textOverflow:'ellipsis',
                          whiteSpace:'nowrap' }}>{user.email}</div>
                      </div>
                      <div style={{ display:'flex', gap:'16px', flexShrink:0 }}>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'13px', fontWeight:'700',
                            color:C.nestGlow, fontFamily:"'DM Mono', monospace" }}>
                            {user.totalSessions}
                          </div>
                          <div style={{ fontSize:'9px', color:C.muted }}>SESSIONS</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'13px', fontWeight:'700',
                            color:C.sage, fontFamily:"'DM Mono', monospace" }}>
                            {user.totalNotes}
                          </div>
                          <div style={{ fontSize:'9px', color:C.muted }}>NOTES</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'13px', fontWeight:'700',
                            color: isPro ? C.amber : C.muted,
                            fontFamily:"'DM Mono', monospace" }}>
                            {isPro ? fmtMoney(PLANS.PRO) : 'FREE'}
                          </div>
                          <div style={{ fontSize:'9px', color:C.muted }}>PLAN</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 &&
                  <div style={{ textAlign:'center', padding:'40px',
                    color:C.muted }}>No users found</div>}
              </div>
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ background:C.card, borderRadius:'16px', padding:'22px',
                border:`1px solid ${C.purple}33`, position:'sticky', top:'20px',
                alignSelf:'start' }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'flex-start', marginBottom:'16px' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'13px',
                    background: selected.isAdmin
                      ? `linear-gradient(135deg,${C.purple},#c39bd3)`
                      : `linear-gradient(135deg,${C.nest},${C.sage})`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'22px', fontWeight:'700', color:C.bg }}>
                    {selected.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <button onClick={() => setSelected(null)}
                    style={{ background:'none', border:'none',
                      color:C.muted, cursor:'pointer', fontSize:'18px' }}>×</button>
                </div>
                <div style={{ fontFamily:"'Fraunces', serif", fontSize:'18px',
                  fontWeight:'700', marginBottom:'2px' }}>{selected.name}</div>
                <div style={{ fontSize:'11px', color:C.muted,
                  marginBottom:'14px' }}>{selected.email}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                  gap:'8px', marginBottom:'14px' }}>
                  {[
                    { l:'Sessions',  v:selected.totalSessions, c:C.nestGlow },
                    { l:'Notes',     v:selected.totalNotes,    c:C.sage },
                    { l:'Streak',    v:`${selected.streakCount||0}d`, c:C.amber },
                    { l:'Study',     v:fmtHours(selected.totalStudySeconds), c:C.blue },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ background:C.surface, borderRadius:'9px',
                      padding:'10px', border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:'15px', fontWeight:'700', color:c,
                        fontFamily:"'DM Mono', monospace" }}>{v}</div>
                      <div style={{ fontSize:'9px', color:C.muted }}>{l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:'11px', color:C.muted,
                  marginBottom:'14px', fontFamily:"'DM Mono', monospace" }}>
                  Joined {fmtDate(selected.createdAt)}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  <button onClick={() => handleToggleAdmin(selected)}
                    style={{ padding:'9px', borderRadius:'9px',
                      border:`1px solid ${C.purple}44`,
                      background: selected.isAdmin ? C.purple+'22' : C.purple,
                      color: selected.isAdmin ? C.purple : C.bg,
                      cursor:'pointer', fontSize:'12px',
                      fontWeight:'700' } as React.CSSProperties}>
                    {selected.isAdmin ? '👑 Remove Admin' : '👑 Make Admin'}
                  </button>
                  <button onClick={() => handleDelete(selected)}
                    style={{ padding:'9px', borderRadius:'9px',
                      border:'1px solid #c0392b44', background:'#c0392b18',
                      color:C.red, cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                    🗑 Delete User
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ENGAGEMENT TAB ────────────────────────── */}
        {tab === 'engagement' && (
          <div>
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
              <MetricCard label="ENGAGEMENT RATE" value={`${engagementRate}%`}
                icon="📊" color={C.teal} sub="30D" />
              <MetricCard label="ACTIVE USERS" value={String(activeUsers.length)}
                icon="🟢" color={C.nestGlow} sub="30D" />
              <MetricCard label="NEW THIS MONTH" value={`+${newThisMonth.length}`}
                icon="🆕" color={C.amber} />
              <MetricCard label="POWER USERS" value={String(powerUsers.length)}
                icon="⚡" color={C.purple} sub="10+ sessions" />
              <MetricCard label="CHURN RISK" value={String(churnRisk.length)}
                icon="⚠️" color={C.red} sub="inactive 30d" />
            </div>

            {/* Top users by engagement */}
            <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
              border:`1px solid ${C.border}`, marginBottom:'16px' }}>
              <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
                color:C.muted, letterSpacing:'1.5px', marginBottom:'16px' }}>
                🏆 TOP USERS BY STUDY TIME
              </div>
              {[...users]
                .sort((a,b) => b.totalStudySeconds - a.totalStudySeconds)
                .slice(0, 8)
                .map((u, i) => (
                  <div key={u.id} style={{ display:'flex', alignItems:'center',
                    gap:'12px', padding:'10px 0',
                    borderBottom: i < 7 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ width:'22px', fontSize:'12px', fontWeight:'700',
                      color: i === 0 ? C.amber : i === 1 ? C.muted : C.border,
                      textAlign:'center', fontFamily:"'DM Mono', monospace" }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}
                    </div>
                    <div style={{ width:'32px', height:'32px', borderRadius:'8px',
                      background:`linear-gradient(135deg,${C.nest},${C.sage})`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'13px', fontWeight:'700', color:C.bg }}>
                      {u.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:'600' }}>{u.name}</div>
                      <div style={{ fontSize:'11px', color:C.muted }}>{u.email}</div>
                    </div>
                    <div style={{ display:'flex', gap:'16px', textAlign:'right' }}>
                      <div>
                        <div style={{ fontSize:'13px', color:C.nestGlow, fontWeight:'700',
                          fontFamily:"'DM Mono', monospace" }}>
                          {fmtHours(u.totalStudySeconds)}
                        </div>
                        <div style={{ fontSize:'9px', color:C.muted }}>STUDY</div>
                      </div>
                      <div>
                        <div style={{ fontSize:'13px', color:C.sage, fontWeight:'700',
                          fontFamily:"'DM Mono', monospace" }}>{u.totalSessions}</div>
                        <div style={{ fontSize:'9px', color:C.muted }}>SESSIONS</div>
                      </div>
                      <div>
                        <div style={{ fontSize:'13px', color:C.amber, fontWeight:'700',
                          fontFamily:"'DM Mono', monospace" }}>
                          {u.streakCount || 0}🔥
                        </div>
                        <div style={{ fontSize:'9px', color:C.muted }}>STREAK</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Role distribution */}
            <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
              border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
                color:C.muted, letterSpacing:'1.5px', marginBottom:'16px' }}>
                👥 USER ROLE DISTRIBUTION
              </div>
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                {['STUDENT','RESEARCHER','PROFESSIONAL','FREELANCER'].map(role => {
                  const count = users.filter(u => u.role === role).length;
                  const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                  return (
                    <div key={role} style={{ flex:1, minWidth:'120px', background:C.surface,
                      borderRadius:'10px', padding:'14px',
                      border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:'20px', marginBottom:'6px' }}>
                        {role === 'STUDENT' ? '🎓' : role === 'RESEARCHER' ? '🔬'
                          : role === 'PROFESSIONAL' ? '💼' : '🚀'}
                      </div>
                      <div style={{ fontFamily:"'Fraunces', serif", fontSize:'20px',
                        fontWeight:'700', color:C.cream }}>{count}</div>
                      <div style={{ fontSize:'10px', color:C.muted,
                        fontFamily:"'DM Mono', monospace", marginBottom:'8px' }}>
                        {role} · {pct}%
                      </div>
                      <div style={{ height:'4px', borderRadius:'2px',
                        background:C.border }}>
                        <div style={{ height:'100%', borderRadius:'2px',
                          background:`linear-gradient(90deg,${C.nest},${C.sage})`,
                          width:`${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

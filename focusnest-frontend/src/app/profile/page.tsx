'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c', amber:'#d4872a',
  muted:'#5a6355', cream:'#e8e0cc', red:'#e74c3c',
};

const inp: React.CSSProperties = {
  width:'100%', background:C.bg, border:`1px solid ${C.border}`,
  borderRadius:'10px', padding:'11px 14px', color:C.cream, fontSize:'13px',
  outline:'none', boxSizing:'border-box', fontFamily:"'Outfit', sans-serif",
};

const lbl: React.CSSProperties = {
  display:'block', marginBottom:'6px', fontSize:'10px', fontWeight:'700',
  letterSpacing:'1.5px', color:C.muted, fontFamily:"'DM Mono', monospace",
};

interface UserProfile {
  id: number; name: string; email: string; role: string;
  streakCount: number; lastStudyDate: string; createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');
  const [toastOk, setToastOk]   = useState(true);
  const [nameForm, setNameForm] = useState('');
  const [pwForm, setPwForm]     = useState({ current:'', next:'', confirm:'' });
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw]     = useState(false);
  const [onboarding, setOnboarding] = useState<Record<string, unknown>>({});

  const showToast = (msg: string, ok = true) => {
    setToast(msg); setToastOk(ok); setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }
    try {
      const ob = localStorage.getItem('fn_onboarding');
      if (ob) setOnboarding(JSON.parse(ob));
    } catch {}
    api.get('/users/me')
      .then(({ data }) => { setProfile(data); setNameForm(data.name); })
      .catch(() => showToast('Failed to load profile', false))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSaveName = async () => {
    if (!nameForm.trim()) { showToast('Name cannot be empty', false); return; }
    setSavingName(true);
    try {
      const { data } = await api.put('/users/me', { name: nameForm });
      setProfile(p => p ? { ...p, name: data.name } : p);
      const raw = localStorage.getItem('fn_user');
      if (raw) {
        const u = JSON.parse(raw);
        localStorage.setItem('fn_user', JSON.stringify({ ...u, name: data.name }));
      }
      showToast('✅ Name updated!');
    } catch { showToast('Failed to update name', false); }
    finally { setSavingName(false); }
  };

  const handleSavePw = async () => {
    if (pwForm.next !== pwForm.confirm) { showToast('Passwords do not match', false); return; }
    if (pwForm.next.length < 8) { showToast('Min 8 characters', false); return; }
    setSavingPw(true);
    try {
      await api.put('/users/me', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwForm({ current:'', next:'', confirm:'' });
      showToast('✅ Password updated!');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to update password', false);
    } finally { setSavingPw(false); }
  };

  const handleClearData = () => {
    if (!confirm('Clear your onboarding preferences? You will be sent through onboarding again.')) return;
    localStorage.removeItem('fn_onboarding');
    router.push('/onboarding');
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>🪺</div>
  );

  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })
    : '—';

  const ob = onboarding as { role?: string; skills?: string[]; dailyTime?: number; slots?: string[] };

  return (
    <div style={{ minHeight:'100vh', background:C.bg,
      fontFamily:"'Outfit', sans-serif", color:C.cream }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999,
          background:C.card, border:`1px solid ${toastOk ? C.nest : C.red}`,
          borderRadius:'12px', padding:'13px 18px', fontSize:'13px', fontWeight:'600',
          boxShadow:`0 0 24px ${toastOk ? C.nest : C.red}33` }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:'14px 28px' }}>
        <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
          color:C.muted, letterSpacing:'1.5px' }}>PROFILE & SETTINGS</div>
      </div>

      <div style={{ padding:'28px', maxWidth:'720px' }}>

        {/* Avatar + overview */}
        <div style={{ background:C.card, borderRadius:'16px', padding:'24px',
          border:`1px solid ${C.border}`, marginBottom:'20px',
          display:'flex', alignItems:'center', gap:'20px' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'16px', flexShrink:0,
            background:`linear-gradient(135deg,${C.nest},${C.sage})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'28px', fontWeight:'700', color:C.bg, fontFamily:"'Fraunces', serif" }}>
            {profile?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:'22px',
              fontWeight:'700', marginBottom:'4px' }}>{profile?.name}</div>
            <div style={{ fontSize:'13px', color:C.muted, marginBottom:'8px' }}>{profile?.email}</div>
            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px',
                background:C.nest+'22', color:C.nestGlow, border:`1px solid ${C.nest}33`,
                fontFamily:"'DM Mono', monospace", fontWeight:'600' }}>
                {profile?.role || 'USER'}
              </span>
              <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px',
                background:C.amber+'22', color:C.amber, border:`1px solid ${C.amber}33`,
                fontFamily:"'DM Mono', monospace", fontWeight:'600' }}>
                🔥 {profile?.streakCount || 0} day streak
              </span>
              <span style={{ fontSize:'11px', color:C.muted,
                fontFamily:"'DM Mono', monospace" }}>
                Joined {joined}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>

          {/* Update name */}
          <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
            border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
              color:C.muted, letterSpacing:'1.5px', marginBottom:'16px' }}>
              ✏️ UPDATE NAME
            </div>
            <label style={lbl}>DISPLAY NAME</label>
            <input value={nameForm} onChange={e => setNameForm(e.target.value)}
              placeholder="Your name" style={{ ...inp, marginBottom:'14px' }} />
            <button onClick={handleSaveName} disabled={savingName}
              style={{ padding:'10px 20px', borderRadius:'10px', border:'none',
                background:`linear-gradient(135deg,${C.nest},${C.sage})`,
                color:C.bg, cursor:'pointer', fontSize:'13px', fontWeight:'700',
                opacity: savingName ? 0.7 : 1 }}>
              {savingName ? 'Saving...' : 'Save Name'}
            </button>
          </div>

          {/* Onboarding prefs */}
          <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
            border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
              color:C.muted, letterSpacing:'1.5px', marginBottom:'16px' }}>
              🪺 LEARNING PREFERENCES
            </div>
            {ob.role && (
              <div style={{ marginBottom:'10px' }}>
                <div style={{ fontSize:'10px', color:C.muted, marginBottom:'3px',
                  fontFamily:"'DM Mono', monospace" }}>ROLE</div>
                <div style={{ fontSize:'13px', color:C.cream }}>{ob.role}</div>
              </div>
            )}
            {ob.dailyTime && (
              <div style={{ marginBottom:'10px' }}>
                <div style={{ fontSize:'10px', color:C.muted, marginBottom:'3px',
                  fontFamily:"'DM Mono', monospace" }}>DAILY GOAL</div>
                <div style={{ fontSize:'13px', color:C.cream }}>
                  {ob.dailyTime >= 60 ? `${ob.dailyTime/60}h` : `${ob.dailyTime}m`} per day
                </div>
              </div>
            )}
            {ob.skills && ob.skills.length > 0 && (
              <div style={{ marginBottom:'12px' }}>
                <div style={{ fontSize:'10px', color:C.muted, marginBottom:'6px',
                  fontFamily:"'DM Mono', monospace" }}>SKILLS</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {ob.skills.slice(0,4).map((s: string) => (
                    <span key={s} style={{ fontSize:'10px', padding:'2px 8px',
                      borderRadius:'20px', background:C.sage+'22', color:C.sage,
                      border:`1px solid ${C.sage}33` }}>{s}</span>
                  ))}
                  {ob.skills.length > 4 &&
                    <span style={{ fontSize:'10px', color:C.muted }}>+{ob.skills.length-4} more</span>}
                </div>
              </div>
            )}
            <button onClick={handleClearData}
              style={{ padding:'8px 14px', borderRadius:'9px',
                border:`1px solid ${C.border}`, background:'transparent',
                color:C.muted, cursor:'pointer', fontSize:'11px' }}>
              ↺ Redo Onboarding
            </button>
          </div>
        </div>

        {/* Change password */}
        <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
          border:`1px solid ${C.border}`, marginBottom:'20px' }}>
          <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
            color:C.muted, letterSpacing:'1.5px', marginBottom:'16px' }}>
            🔒 CHANGE PASSWORD
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'14px' }}>
            {[
              { key:'current', label:'CURRENT PASSWORD', placeholder:'Current password' },
              { key:'next',    label:'NEW PASSWORD',     placeholder:'Min 8 characters' },
              { key:'confirm', label:'CONFIRM NEW',      placeholder:'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input type="password" placeholder={placeholder}
                  value={pwForm[key as keyof typeof pwForm]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inp} />
              </div>
            ))}
          </div>
          <button onClick={handleSavePw} disabled={savingPw}
            style={{ padding:'10px 20px', borderRadius:'10px', border:'none',
              background:`linear-gradient(135deg,${C.nest},${C.sage})`,
              color:C.bg, cursor:'pointer', fontSize:'13px', fontWeight:'700',
              opacity: savingPw ? 0.7 : 1 }}>
            {savingPw ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Danger zone */}
        <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
          border:`1px solid #c0392b33` }}>
          <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
            color:C.red, letterSpacing:'1.5px', marginBottom:'16px' }}>
            ⚠️ DANGER ZONE
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'600', marginBottom:'3px' }}>Sign out everywhere</div>
              <div style={{ fontSize:'12px', color:C.muted }}>Clear all local data and return to login</div>
            </div>
            <button onClick={() => { localStorage.clear(); router.push('/login'); }}
              style={{ padding:'9px 18px', borderRadius:'9px',
                border:'1px solid #c0392b44', background:'#c0392b18',
                color:C.red, cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

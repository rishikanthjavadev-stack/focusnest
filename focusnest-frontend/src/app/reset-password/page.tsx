'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c',
  muted:'#5a6355', cream:'#e8e0cc', red:'#e74c3c',
};

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get('token') || '';

  const [pw, setPw]           = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or expired reset link.');
  }, [token]);

  const handleReset = async () => {
    if (pw.length < 8)  { setError('Password must be at least 8 characters'); return; }
    if (pw !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: pw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Reset failed'); return; }
      setDone(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width:'100%', background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:'10px', padding:'13px 14px', color:C.cream, fontSize:'14px',
    outline:'none', boxSizing:'border-box', fontFamily:"'Outfit', sans-serif",
  };

  if (done) return (
    <div style={{ textAlign:'center', maxWidth:'400px', margin:'0 auto' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>✅</div>
      <div style={{ fontFamily:"'Fraunces', serif", fontSize:'24px',
        fontWeight:'700', color:C.cream, marginBottom:'10px' }}>
        Password reset!
      </div>
      <div style={{ fontSize:'14px', color:C.muted, marginBottom:'28px' }}>
        Your password has been updated. You can now sign in.
      </div>
      <button onClick={() => router.push('/login')}
        style={{ padding:'12px 28px', borderRadius:'10px', border:'none',
          background:`linear-gradient(135deg,${C.nest},${C.sage})`,
          color:C.bg, cursor:'pointer', fontSize:'14px', fontWeight:'700' }}>
        Sign In →
      </button>
    </div>
  );

  return (
    <div style={{ width:'100%', maxWidth:'400px', margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:'32px' }}>
        <div style={{ width:'48px', height:'48px', borderRadius:'12px',
          background:`linear-gradient(135deg,${C.nest},${C.sage})`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'24px', margin:'0 auto 12px' }}>🔒</div>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:'22px',
          fontWeight:'700', color:C.cream }}>Set New Password</div>
        <div style={{ fontSize:'13px', color:C.muted, marginTop:'6px' }}>
          Must be at least 8 characters
        </div>
      </div>

      <div style={{ background:C.card, borderRadius:'16px', padding:'28px',
        border:`1px solid ${C.border}` }}>
        {error && (
          <div style={{ background:'#c0392b18', border:'1px solid #c0392b44',
            borderRadius:'9px', padding:'11px 14px', fontSize:'13px',
            color:C.red, marginBottom:'16px' }}>{error}</div>
        )}
        <label style={{ display:'block', fontSize:'10px', fontWeight:'700',
          letterSpacing:'1.5px', color:C.muted, marginBottom:'7px',
          fontFamily:"'DM Mono', monospace" }}>NEW PASSWORD</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)}
          placeholder="Min 8 characters"
          style={{ ...inp, marginBottom:'14px' }} />

        <label style={{ display:'block', fontSize:'10px', fontWeight:'700',
          letterSpacing:'1.5px', color:C.muted, marginBottom:'7px',
          fontFamily:"'DM Mono', monospace" }}>CONFIRM PASSWORD</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleReset()}
          placeholder="Repeat new password"
          style={{ ...inp, marginBottom:'18px' }} />

        {/* Password strength indicator */}
        <div style={{ marginBottom:'18px' }}>
          <div style={{ height:'4px', borderRadius:'2px', background:C.border,
            marginBottom:'6px' }}>
            <div style={{ height:'100%', borderRadius:'2px', transition:'width 0.3s',
              background: pw.length === 0 ? 'transparent'
                : pw.length < 6 ? C.red
                : pw.length < 10 ? C.amber
                : C.nestGlow,
              width: pw.length === 0 ? '0%'
                : pw.length < 6 ? '33%'
                : pw.length < 10 ? '66%'
                : '100%' }} />
          </div>
          <div style={{ fontSize:'10px', color:C.muted, fontFamily:"'DM Mono', monospace" }}>
            {pw.length === 0 ? '' : pw.length < 6 ? 'WEAK' : pw.length < 10 ? 'GOOD' : 'STRONG'}
          </div>
        </div>

        <button onClick={handleReset} disabled={loading || !token}
          style={{ width:'100%', padding:'13px', borderRadius:'10px',
            border:'none', fontSize:'14px', fontWeight:'700',
            cursor: loading || !token ? 'not-allowed' : 'pointer',
            background:`linear-gradient(135deg,${C.nest},${C.sage})`,
            color:C.bg, opacity: loading || !token ? 0.7 : 1 }}>
          {loading ? 'Resetting...' : 'Reset Password →'}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0c0f0a', display:'flex',
      alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <Suspense fallback={<div style={{ color:'#5a6355' }}>Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}

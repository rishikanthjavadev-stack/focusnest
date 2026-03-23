'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c',
  muted:'#5a6355', cream:'#e8e0cc', red:'#e74c3c',
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always show success (security best practice — don't reveal if email exists)
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width:'100%', background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:'10px', padding:'13px 14px', color:C.cream, fontSize:'14px',
    outline:'none', boxSizing:'border-box', fontFamily:"'Outfit', sans-serif",
  };

  if (sent) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex',
      alignItems:'center', justifyContent:'center', padding:'20px',
      fontFamily:"'Outfit', sans-serif" }}>
      <div style={{ textAlign:'center', maxWidth:'400px' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>📬</div>
        <div style={{ fontFamily:"'Fraunces', serif", fontSize:'24px',
          fontWeight:'700', color:C.cream, marginBottom:'10px' }}>
          Check your inbox
        </div>
        <div style={{ fontSize:'14px', color:C.muted, lineHeight:'1.7',
          marginBottom:'28px' }}>
          If <strong style={{ color:C.cream }}>{email}</strong> is registered,
          you'll receive a password reset link shortly.
          Check your spam folder if you don't see it.
        </div>
        <button onClick={() => router.push('/login')}
          style={{ padding:'12px 28px', borderRadius:'10px', border:'none',
            background:`linear-gradient(135deg,${C.nest},${C.sage})`,
            color:C.bg, cursor:'pointer', fontSize:'14px', fontWeight:'700' }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex',
      alignItems:'center', justifyContent:'center', padding:'20px',
      fontFamily:"'Outfit', sans-serif" }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'12px',
            background:`linear-gradient(135deg,${C.nest},${C.sage})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'24px', margin:'0 auto 12px' }}>🪺</div>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:'22px',
            fontWeight:'700', color:C.cream }}>Forgot Password?</div>
          <div style={{ fontSize:'13px', color:C.muted, marginTop:'6px' }}>
            No worries — we'll send you reset instructions
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
            fontFamily:"'DM Mono', monospace" }}>YOUR EMAIL</label>
          <input value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            type="email" placeholder="you@example.com"
            style={{ ...inp, marginBottom:'18px' }} />

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'13px', borderRadius:'10px',
              border:'none', fontSize:'14px', fontWeight:'700',
              cursor: loading ? 'not-allowed' : 'pointer',
              background:`linear-gradient(135deg,${C.nest},${C.sage})`,
              color:C.bg, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending...' : 'Send Reset Link →'}
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'13px',
          color:C.muted }}>
          Remember your password?{' '}
          <span onClick={() => router.push('/login')}
            style={{ color:C.nestGlow, cursor:'pointer', fontWeight:'600' }}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}

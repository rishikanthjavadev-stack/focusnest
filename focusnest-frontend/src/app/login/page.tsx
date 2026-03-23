'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('fn_access',  data.accessToken);
      localStorage.setItem('fn_refresh', data.refreshToken);
      localStorage.setItem('fn_user', JSON.stringify({
        id: data.userId, name: data.name, email: data.email,
      }));
      // If no onboarding set, create a default so existing users skip it
      if (!localStorage.getItem('fn_onboarding')) {
        localStorage.setItem('fn_onboarding', JSON.stringify({
          role: 'Working Professional', skills: [], dailyTime: 60, slots: []
        }));
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const s = {
    wrap:  { minHeight:'100vh', background:'#0c0f0a', display:'flex', alignItems:'center',
             justifyContent:'center', padding:'20px', fontFamily:"'Outfit', sans-serif" } as React.CSSProperties,
    box:   { background:'#141710', borderRadius:'18px', padding:'32px',
             border:'1px solid #252b1f' } as React.CSSProperties,
    input: { width:'100%', background:'#0c0f0a', border:'1px solid #252b1f', borderRadius:'10px',
             padding:'12px 16px', color:'#e8e0cc', fontSize:'14px', outline:'none',
             boxSizing:'border-box' as const, fontFamily:"'Outfit', sans-serif" },
    btn:   { width:'100%', padding:'13px', borderRadius:'10px', border:'none',
             background:'linear-gradient(135deg, #4a7c59, #8fad7c)', color:'#0c0f0a',
             fontSize:'15px', fontWeight:'700', cursor:'pointer' } as React.CSSProperties,
    lbl:   { display:'block', marginBottom:'6px', fontSize:'10px', fontWeight:'700',
             letterSpacing:'1.5px', color:'#5a6355', fontFamily:"'DM Mono', monospace" } as React.CSSProperties,
    oauth: { flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #252b1f',
             background:'#0c0f0a', color:'#e8e0cc', fontSize:'13px', fontWeight:'600',
             textAlign:'center' as const, textDecoration:'none', display:'block' },
  };

  return (
    <div style={s.wrap}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'28px' }}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px',
            background:'linear-gradient(135deg,#4a7c59,#8fad7c)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>🪺</div>
          <div>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:'18px',
              fontWeight:'700', color:'#e8e0cc' }}>FocusNest</div>
            <div style={{ fontSize:'10px', color:'#5a6355' }}>Build your focus. Grow your skills.</div>
          </div>
        </div>

        <div style={s.box}>
          <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:'24px',
            fontWeight:'700', marginBottom:'4px', color:'#e8e0cc' }}>Welcome back</h1>
          <p style={{ fontSize:'13px', color:'#5a6355', marginBottom:'24px' }}>Sign in to your nest</p>

          {error && (
            <div style={{ marginBottom:'16px', padding:'12px', background:'#c0392b18',
              border:'1px solid #c0392b44', borderRadius:'10px', fontSize:'13px', color:'#e74c3c' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'16px' }}>
              <label style={s.lbl}>EMAIL</label>
              <input type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={s.input} />
            </div>
            <div style={{ marginBottom:'20px' }}>
              <label style={s.lbl}>PASSWORD</label>
              <input type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={s.input} />
            </div>
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'20px 0' }}>
            <div style={{ flex:1, height:'1px', background:'#252b1f' }} />
            <span style={{ fontSize:'11px', color:'#5a6355' }}>or continue with</span>
            <div style={{ flex:1, height:'1px', background:'#252b1f' }} />
          </div>

          <div style={{ display:'flex', gap:'10px' }}>
            <a href={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL} style={s.oauth}>🌐 Google</a>
            <a href={process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL} style={s.oauth}>🐙 GitHub</a>
          </div>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#5a6355', marginTop:'20px' }}>
            <Link href="/forgot-password" style={{ color:'#6db882', fontWeight:'600' }}>
              Forgot password?
            </Link>
            {'  ·  '}
            No account?{' '}
            <Link href="/register" style={{ color:'#4a7c59', fontWeight:'600' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0c0f0a',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>🪺</div>}>
      <LoginForm />
    </Suspense>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
      });
      // Save everything to localStorage
      localStorage.setItem('fn_access',  data.accessToken);
      localStorage.setItem('fn_refresh', data.refreshToken);
      localStorage.setItem('fn_user', JSON.stringify({
        id: data.userId, name: data.name, email: data.email,
      }));
      router.push('/onboarding');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  const s = {
    wrap:  { minHeight:'100vh', background:'#0c0f0a', display:'flex', alignItems:'center',
             justifyContent:'center', padding:'20px', fontFamily:"'Outfit', sans-serif" } as React.CSSProperties,
    box:   { background:'#141710', borderRadius:'18px', padding:'32px',
             border:'1px solid #252b1f', width:'100%', maxWidth:'420px' } as React.CSSProperties,
    input: { width:'100%', background:'#0c0f0a', border:'1px solid #252b1f', borderRadius:'10px',
             padding:'12px 16px', color:'#e8e0cc', fontSize:'14px', outline:'none',
             boxSizing:'border-box' as const, fontFamily:"'Outfit', sans-serif", marginBottom:'14px' },
    btn:   { width:'100%', padding:'13px', borderRadius:'10px', border:'none',
             background:'linear-gradient(135deg, #4a7c59, #8fad7c)', color:'#0c0f0a',
             fontSize:'15px', fontWeight:'700', cursor:'pointer', marginTop:'6px' } as React.CSSProperties,
    lbl:   { display:'block', marginBottom:'6px', fontSize:'10px', fontWeight:'700',
             letterSpacing:'1.5px', color:'#5a6355', fontFamily:"'DM Mono', monospace" } as React.CSSProperties,
  };

  const fields = [
    { label:'YOUR NAME', key:'name',     type:'text',     placeholder:'Alex Chen' },
    { label:'EMAIL',     key:'email',    type:'email',    placeholder:'you@example.com' },
    { label:'PASSWORD',  key:'password', type:'password', placeholder:'Min 8 characters' },
    { label:'CONFIRM',   key:'confirm',  type:'password', placeholder:'Repeat password' },
  ];

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
            fontWeight:'700', marginBottom:'4px', color:'#e8e0cc' }}>Create your nest</h1>
          <p style={{ fontSize:'13px', color:'#5a6355', marginBottom:'24px' }}>
            Start your learning journey today
          </p>

          {error && (
            <div style={{ marginBottom:'16px', padding:'12px', background:'#c0392b18',
              border:'1px solid #c0392b44', borderRadius:'10px', fontSize:'13px', color:'#e74c3c' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={s.lbl}>{label}</label>
                <input type={type} required placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={s.input} />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              ...s.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating your nest...' : '🪺 Create Account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#5a6355', marginTop:'20px' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color:'#4a7c59', fontWeight:'600' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

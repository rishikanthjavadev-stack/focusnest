'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c', amber:'#d4872a',
  muted:'#5a6355', cream:'#e8e0cc',
};

const NAV = [
  { path:'/dashboard', icon:'🏠', label:'Dashboard' },
  { path:'/timer',     icon:'⏱', label:'Timer'      },
  { path:'/notes',     icon:'📝', label:'Notes'      },
  { path:'/analytics', icon:'📊', label:'Analytics'  },
];

export default function Sidebar() {
  const router    = useRouter();
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fn_user');
      if (raw) setUserEmail(JSON.parse(raw).email || '');
    } catch {}
  }, []);

  const logout = () => { localStorage.clear(); router.push('/login'); };
  const w = collapsed ? '64px' : '200px';

  return (
    <div style={{ width:w, minHeight:'100vh', background:C.surface,
      borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column',
      transition:'width 0.2s ease', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>

      {/* Logo */}
      <div style={{ padding: collapsed ? '18px 0' : '18px 16px',
        display:'flex', alignItems:'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom:`1px solid ${C.border}`, gap:'10px' }}>
        {!collapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'7px', flexShrink:0,
              background:`linear-gradient(135deg,${C.nest},${C.sage})`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>🪺</div>
            <span style={{ fontFamily:"'Fraunces', serif", fontSize:'15px',
              fontWeight:'700', color:C.cream, whiteSpace:'nowrap' }}>FocusNest</span>
          </div>
        )}
        {collapsed && (
          <div style={{ width:'28px', height:'28px', borderRadius:'7px',
            background:`linear-gradient(135deg,${C.nest},${C.sage})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>🪺</div>
        )}
        <button onClick={() => setCollapsed(v => !v)}
          style={{ background:'none', border:'none', color:C.muted, cursor:'pointer',
            fontSize:'14px', padding:'4px', flexShrink:0, lineHeight:1 }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:'4px' }}>
        {NAV.map(({ path, icon, label }) => {
          const active = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
          return (
            <button key={path} onClick={() => router.push(path)}
              title={collapsed ? label : undefined}
              style={{ display:'flex', alignItems:'center',
                gap: collapsed ? '0' : '10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '11px 0' : '11px 12px',
                borderRadius:'10px', border:'none', cursor:'pointer',
                background: active ? C.nest+'33' : 'transparent',
                color: active ? C.nestGlow : C.muted,
                fontFamily:"'Outfit', sans-serif", fontSize:'13px',
                fontWeight: active ? '700' : '500',
                transition:'all 0.15s',
                borderLeft: active ? `3px solid ${C.nest}` : '3px solid transparent',
              }}>
              <span style={{ fontSize:'17px', flexShrink:0 }}>{icon}</span>
              {!collapsed && <span style={{ whiteSpace:'nowrap' }}>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'12px 8px', borderTop:`1px solid ${C.border}` }}>
        {!collapsed && userEmail && (
          <div style={{ padding:'8px 12px', marginBottom:'6px',
            fontSize:'11px', color:C.muted, fontFamily:"'DM Mono', monospace",
            letterSpacing:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {userEmail}
          </div>
        )}
        <button onClick={logout} title={collapsed ? 'Sign out' : undefined}
          style={{ display:'flex', alignItems:'center',
            gap: collapsed ? '0' : '10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            width:'100%', padding: collapsed ? '11px 0' : '11px 12px',
            borderRadius:'10px', border:'none', cursor:'pointer',
            background:'transparent', color:C.muted,
            fontFamily:"'Outfit', sans-serif", fontSize:'13px',
            transition:'all 0.15s' }}>
          <span style={{ fontSize:'17px' }}>🚪</span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

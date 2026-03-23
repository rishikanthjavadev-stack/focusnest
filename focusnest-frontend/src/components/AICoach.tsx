'use client';
import { useState, useRef, useEffect } from 'react';
import api from '@/services/api';

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c', amber:'#d4872a',
  muted:'#5a6355', cream:'#e8e0cc',
};

interface Message { role:'user'|'assistant'; content: string; }

const SUGGESTIONS = [
  'How do I stay focused during study sessions?',
  'Give me a quick motivation boost 🔥',
  'What is the Pomodoro technique?',
  'How do I beat procrastination?',
];

export default function AICoach() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role:'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', { message: msg, history });
      setMessages(prev => [...prev, { role:'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, {
        role:'assistant', content:'Sorry, having trouble connecting. Try again! 🪺'
      }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // Floating button when closed
  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:1000,
        width:'52px', height:'52px', borderRadius:'50%', border:'none',
        background:`linear-gradient(135deg,${C.nest},${C.sage})`,
        cursor:'pointer', fontSize:'22px', boxShadow:`0 4px 20px ${C.nest}66`,
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'transform 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      🤖
    </button>
  );

  return (
    <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:1000,
      width:'360px', height:'520px', background:C.surface,
      borderRadius:'18px', border:`1px solid ${C.border}`,
      boxShadow:`0 8px 40px #00000088`, display:'flex', flexDirection:'column',
      fontFamily:"'Outfit', sans-serif", overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'14px 16px', background:C.card,
        borderBottom:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'8px',
            background:`linear-gradient(135deg,${C.nest},${C.sage})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🤖</div>
          <div>
            <div style={{ fontSize:'13px', fontWeight:'700', color:C.cream }}>FocusNest AI</div>
            <div style={{ fontSize:'10px', color:C.nestGlow }}>● Online</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)}
          style={{ background:'none', border:'none', color:C.muted,
            cursor:'pointer', fontSize:'18px', lineHeight:1 }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px',
        display:'flex', flexDirection:'column', gap:'10px' }}>

        {messages.length === 0 && (
          <div style={{ textAlign:'center', padding:'20px 10px' }}>
            <div style={{ fontSize:'28px', marginBottom:'10px' }}>🪺</div>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:'15px',
              color:C.cream, marginBottom:'6px' }}>Hi! I'm your Study Coach</div>
            <div style={{ fontSize:'12px', color:C.muted, marginBottom:'16px' }}>
              Ask me anything about studying, focus, or your progress.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  style={{ padding:'8px 12px', borderRadius:'10px', border:`1px solid ${C.border}`,
                    background:C.card, color:C.sage, cursor:'pointer', fontSize:'11px',
                    textAlign:'left', fontFamily:"'Outfit', sans-serif",
                    transition:'border-color 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth:'85%', padding:'10px 13px', borderRadius:
                m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role === 'user'
                ? `linear-gradient(135deg,${C.nest},${C.sage})`
                : C.card,
              color: m.role === 'user' ? C.bg : C.cream,
              fontSize:'13px', lineHeight:'1.6',
              border: m.role === 'assistant' ? `1px solid ${C.border}` : 'none',
              whiteSpace:'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', justifyContent:'flex-start' }}>
            <div style={{ padding:'10px 16px', borderRadius:'14px 14px 14px 4px',
              background:C.card, border:`1px solid ${C.border}`,
              fontSize:'18px', letterSpacing:'3px', color:C.muted }}>
              <span style={{ animation:'pulse 1s infinite' }}>···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'12px', borderTop:`1px solid ${C.border}`,
        display:'flex', gap:'8px', alignItems:'flex-end' }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey} placeholder="Ask your study coach..."
          rows={1} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`,
            borderRadius:'10px', padding:'10px 12px', color:C.cream, fontSize:'13px',
            outline:'none', resize:'none', fontFamily:"'Outfit', sans-serif",
            lineHeight:'1.5', maxHeight:'80px', overflowY:'auto' }} />
        <button onClick={() => send()}  disabled={!input.trim() || loading}
          style={{ width:'36px', height:'36px', borderRadius:'10px', border:'none',
            background: input.trim() && !loading
              ? `linear-gradient(135deg,${C.nest},${C.sage})` : C.card,
            color: input.trim() && !loading ? C.bg : C.muted,
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0 }}>
          ↑
        </button>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

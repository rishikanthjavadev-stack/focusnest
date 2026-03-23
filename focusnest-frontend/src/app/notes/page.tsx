'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface Note {
  id: number; title: string; content: string;
  tags: string[]; topic: string;
  isPinned: boolean; isResearch: boolean;
  createdAt: string; updatedAt: string;
}

const C = {
  bg:'#0c0f0a', surface:'#141710', card:'#1a1e16', border:'#252b1f',
  nest:'#4a7c59', nestGlow:'#6db882', sage:'#8fad7c', amber:'#d4872a',
  muted:'#5a6355', cream:'#e8e0cc', red:'#e74c3c',
};

const fmtDate = (d: string) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' });
};

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes]             = useState<Note[]>([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState('');
  const [activeNote, setActiveNote]   = useState<Note | null>(null);
  const [isNew, setIsNew]             = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [editTitle, setEditTitle]     = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags]       = useState('');
  const [editTopic, setEditTopic]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [showMeta, setShowMeta]       = useState(false);
  const [selectMode, setSelectMode]   = useState(false);
  const [selected, setSelected]       = useState<Set<number>>(new Set());
  const [showExport, setShowExport]   = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Floating timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    // Auto-start timer when editor opens
    if (activeNote !== null || isNew) {
      setTimerSeconds(0);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
      setTimerSeconds(0);
    }
  }, [activeNote, isNew]);

  const fmtTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadNotes = useCallback(async () => {
    try {
      const { data } = search.trim()
        ? await api.get(`/notes/search?q=${encodeURIComponent(search)}`)
        : await api.get('/notes');
      setNotes(Array.isArray(data) ? data : []);
    } catch { showToast('Failed to load notes'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const token = localStorage.getItem('fn_access');
    if (!token) { router.push('/login'); return; }
    const t = setTimeout(() => loadNotes(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [router, loadNotes, search]);

  // Auto-save on content change
  useEffect(() => {
    if (!activeNote && !isNew) return;
    if (!editTitle.trim() && !editContent.trim()) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { autoSave(); }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [editTitle, editContent, editTags, editTopic]);

  const autoSave = async () => {
    if (!editTitle.trim() && !editContent.trim()) return;
    setSaving(true);
    const payload = {
      title:   editTitle || 'Untitled',
      content: editContent,
      tags:    editTags.split(',').map(t => t.trim()).filter(Boolean),
      topic:   editTopic,
    };
    try {
      if (isNew) {
        const { data } = await api.post('/notes', payload);
        const newNote = { ...data, tags: payload.tags, topic: payload.topic };
        setNotes(ns => [newNote, ...ns]);
        setActiveNote(newNote);
        setIsNew(false);
      } else if (activeNote) {
        const { data } = await api.put(`/notes/${activeNote.id}`, payload);
        const updated = { ...activeNote, ...data, tags: payload.tags, topic: payload.topic };
        setNotes(ns => ns.map(n => n.id === activeNote.id ? updated : n));
        setActiveNote(updated);
      }
    } catch {}
    finally { setSaving(false); }
  };

  const openNew = () => {
    setActiveNote(null);
    setIsNew(true);
    setEditTitle('');
    setEditContent('');
    setEditTags('');
    setEditTopic('');
    setShowMeta(false);
    setTimeout(() => contentRef.current?.focus(), 100);
  };

  const openNote = (note: Note) => {
    if (selectMode) { toggleSelect(note.id); return; }
    setActiveNote(note);
    setIsNew(false);
    setEditTitle(note.title === 'Untitled' ? '' : note.title);
    setEditContent(note.content || '');
    setEditTags((note.tags || []).join(', '));
    setEditTopic(note.topic || '');
    setShowMeta(false);
    setTimeout(() => contentRef.current?.focus(), 100);
  };

  const closeEditor = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await autoSave();
    setActiveNote(null);
    setIsNew(false);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/notes/${id}`);
    setNotes(ns => ns.filter(n => n.id !== id));
    if (activeNote?.id === id) { setActiveNote(null); setIsNew(false); }
    showToast('🗑 Deleted');
  };

  const handlePin = async (note: Note) => {
    await api.put(`/notes/${note.id}`, { ...note, isPinned: !note.isPinned });
    setNotes(ns => ns.map(n => n.id === note.id ? { ...n, isPinned: !note.isPinned } : n)
      .sort((a,b) => (b.isPinned?1:0) - (a.isPinned?1:0)));
  };

  const toggleSelect = (id: number) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleBulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} note(s)?`)) return;
    await Promise.all([...selected].map(id => api.delete(`/notes/${id}`)));
    setNotes(ns => ns.filter(n => !selected.has(n.id)));
    setSelected(new Set()); setSelectMode(false);
    showToast(`🗑 ${selected.size} deleted`);
  };

  const doExport = (fmt: 'txt'|'md'|'json') => {
    const subset = selected.size > 0 ? notes.filter(n => selected.has(n.id)) : notes;
    let text = '', mime = 'text/plain';
    if (fmt === 'txt') {
      text = subset.map(n => `TITLE: ${n.title}\n\n${n.content}`).join('\n\n' + '='.repeat(40) + '\n\n');
    } else if (fmt === 'md') {
      text = subset.map(n => `## ${n.title}\n\n${n.content}`).join('\n\n---\n\n');
      mime = 'text/markdown';
    } else {
      text = JSON.stringify(subset, null, 2); mime = 'application/json';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = `focusnest-notes.${fmt}`; a.click();
    URL.revokeObjectURL(a.href); setShowExport(false);
    showToast(`📥 Exported as ${fmt.toUpperCase()}`);
  };

  const wordCount = editContent.trim() ? editContent.trim().split(/\s+/).length : 0;
  const charCount = editContent.length;

  // ── FULLSCREEN EDITOR ──────────────────────────────────────────
  if (activeNote !== null || isNew) return (
    <div style={{ position:'fixed', inset:0, background:C.bg, zIndex:500,
      fontFamily:"'Outfit', sans-serif", color:C.cream,
      display:'flex', flexDirection:'column' }}>

      {/* Tiny timer bar at very top */}
      <div style={{ height:'28px', background:'transparent',
        display:'flex', alignItems:'center', justifyContent:'center',
        gap:'10px', opacity:0.35, transition:'opacity 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}>
        <span style={{ fontSize:'11px', fontFamily:"'DM Mono', monospace",
          color:C.nestGlow, letterSpacing:'2px', fontWeight:'700' }}>
          ⏱ {fmtTimer(timerSeconds)}
        </span>
        <button onClick={() => setTimerRunning(r => !r)}
          style={{ background:'none', border:`1px solid ${C.border}`,
            borderRadius:'4px', color:C.muted, cursor:'pointer',
            fontSize:'9px', padding:'1px 6px',
            fontFamily:"'DM Mono', monospace" }}>
          {timerRunning ? 'PAUSE' : 'RESUME'}
        </button>
      </div>

      {/* Minimal top bar */}
      <div style={{ padding:'12px 28px', display:'flex', alignItems:'center',
        justifyContent:'space-between', opacity: 0.4,
        transition:'opacity 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}>
        <button onClick={closeEditor}
          style={{ background:'none', border:'none', color:C.muted,
            cursor:'pointer', fontSize:'13px', display:'flex',
            alignItems:'center', gap:'6px', fontFamily:"'Outfit', sans-serif" }}>
          ← Back to notes
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <span style={{ fontSize:'11px', color:C.muted,
            fontFamily:"'DM Mono', monospace" }}>
            {saving ? 'saving...' : '✓ saved'}
          </span>
          <span style={{ fontSize:'11px', color:C.muted,
            fontFamily:"'DM Mono', monospace" }}>
            {wordCount} words
          </span>
          <button onClick={() => setShowMeta(v => !v)}
            style={{ background:'none', border:'none', color:C.muted,
              cursor:'pointer', fontSize:'12px',
              fontFamily:"'Outfit', sans-serif" }}>
            {showMeta ? 'Hide info ↑' : 'Tags & topic ↓'}
          </button>
          {activeNote && (
            <button onClick={() => handleDelete(activeNote.id)}
              style={{ background:'none', border:'none', color:C.muted,
                cursor:'pointer', fontSize:'12px' }}>🗑</button>
          )}
        </div>
      </div>

      {/* Meta panel — tags/topic */}
      {showMeta && (
        <div style={{ padding:'0 48px 16px', display:'flex', gap:'12px' }}>
          <input value={editTopic} onChange={e => setEditTopic(e.target.value)}
            placeholder="Topic (e.g. Machine Learning)"
            style={{ flex:1, background:'transparent', border:'none',
              borderBottom:`1px solid ${C.border}`, color:C.muted,
              fontSize:'13px', outline:'none', padding:'6px 0',
              fontFamily:"'Outfit', sans-serif" }} />
          <input value={editTags} onChange={e => setEditTags(e.target.value)}
            placeholder="Tags (comma separated)"
            style={{ flex:1, background:'transparent', border:'none',
              borderBottom:`1px solid ${C.border}`, color:C.muted,
              fontSize:'13px', outline:'none', padding:'6px 0',
              fontFamily:"'Outfit', sans-serif" }} />
        </div>
      )}

      {/* Editor area */}
      <div style={{ flex:1, padding:'0 48px', display:'flex', flexDirection:'column',
        maxWidth:'100%', width:'100%', boxSizing:'border-box' }}>

        {/* Title */}
        <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
          placeholder="Untitled"
          style={{ background:'transparent', border:'none', outline:'none',
            fontFamily:"'Fraunces', serif", fontSize:'36px', fontWeight:'700',
            color:C.cream, width:'100%', marginBottom:'16px',
            padding:'0', caretColor:C.nestGlow }} />

        {/* Divider */}
        <div style={{ height:'1px', background:C.border, marginBottom:'24px' }} />

        {/* Content */}
        <textarea ref={contentRef}
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          placeholder="Start writing..."
          style={{ flex:1, background:'transparent', border:'none', outline:'none',
            color:'#c8c0b0', fontSize:'18px', lineHeight:'1.9',
            fontFamily:"'Outfit', sans-serif", fontWeight:'400',
            resize:'none', width:'100%', minHeight:'60vh',
            caretColor:C.nestGlow, padding:'0' }} />
      </div>

      {/* Bottom status bar */}
      <div style={{ padding:'10px 48px', display:'flex', gap:'20px',
        opacity:0.35, fontSize:'11px', color:C.muted,
        fontFamily:"'DM Mono', monospace" }}>
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        {activeNote && <span>Last saved {fmtDate(activeNote.updatedAt || activeNote.createdAt)}</span>}
      </div>
    </div>
  );

  // ── NOTES LIST ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C.bg,
      fontFamily:"'Outfit', sans-serif", color:C.cream }}>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999,
          background:C.card, border:`1px solid ${C.nest}`,
          borderRadius:'12px', padding:'12px 18px', fontSize:'13px',
          fontWeight:'600', boxShadow:`0 0 20px ${C.nest}33` }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:'14px 28px', display:'flex', alignItems:'center',
        justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontSize:'10px', fontFamily:"'DM Mono', monospace",
            color:C.muted, letterSpacing:'1.5px' }}>NOTES</div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search..."
            style={{ background:C.card, border:`1px solid ${C.border}`,
              borderRadius:'8px', padding:'7px 12px', color:C.cream,
              fontSize:'12px', outline:'none', width:'200px',
              fontFamily:"'Outfit', sans-serif" }} />
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <button onClick={() => { setSelectMode(v => !v); setSelected(new Set()); }}
            style={{ padding:'7px 12px', borderRadius:'8px',
              border:`1px solid ${selectMode ? C.nest : C.border}`,
              background: selectMode ? C.nest+'22' : 'transparent',
              color: selectMode ? C.nestGlow : C.muted,
              cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
            {selectMode ? `✓ ${selected.size}` : '☑ Select'}
          </button>
          {selectMode && selected.size > 0 && (
            <button onClick={handleBulkDelete}
              style={{ padding:'7px 12px', borderRadius:'8px',
                border:'1px solid #c0392b44', background:'#c0392b18',
                color:C.red, cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
              🗑 ({selected.size})
            </button>
          )}
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowExport(v => !v)}
              style={{ padding:'7px 12px', borderRadius:'8px',
                border:`1px solid ${C.border}`, background:'transparent',
                color:C.muted, cursor:'pointer', fontSize:'12px' }}>
              ⬇ Export ▾
            </button>
            {showExport && (
              <div style={{ position:'absolute', top:'36px', right:0, zIndex:100,
                background:C.card, border:`1px solid ${C.border}`,
                borderRadius:'10px', overflow:'hidden', minWidth:'170px',
                boxShadow:'0 8px 24px #00000066' }}>
                {(['txt','md','json'] as const).map(fmt => (
                  <button key={fmt} onClick={() => doExport(fmt)}
                    style={{ width:'100%', padding:'10px 14px', background:'transparent',
                      border:'none', borderBottom:`1px solid ${C.border}`,
                      color:C.cream, cursor:'pointer', textAlign:'left',
                      fontSize:'12px', fontFamily:"'Outfit', sans-serif" }}>
                    {fmt === 'txt' ? '📄 Plain Text' : fmt === 'md' ? '📝 Markdown' : '🗂 JSON'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={openNew}
            style={{ padding:'7px 16px', borderRadius:'8px', border:'none',
              background:`linear-gradient(135deg,${C.nest},${C.sage})`,
              color:C.bg, cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
            + New Note
          </button>
        </div>
      </div>

      <div style={{ padding:'24px 28px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:C.muted }}>Loading...</div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📝</div>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:'22px',
              marginBottom:'8px' }}>No notes yet</div>
            <div style={{ fontSize:'13px', color:C.muted, marginBottom:'24px' }}>
              Click to open a blank page and start writing
            </div>
            <button onClick={openNew}
              style={{ padding:'12px 24px', borderRadius:'10px', border:'none',
                background:`linear-gradient(135deg,${C.nest},${C.sage})`,
                color:C.bg, cursor:'pointer', fontSize:'14px', fontWeight:'700' }}>
              + Create First Note
            </button>
          </div>
        ) : (
          <div style={{ display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'12px' }}>

            {/* New note card */}
            <div onClick={openNew}
              style={{ background:'transparent', borderRadius:'13px', padding:'20px',
                border:`2px dashed ${C.border}`, cursor:'pointer',
                display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap:'8px', minHeight:'140px',
                transition:'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.nest)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
              <div style={{ fontSize:'24px', color:C.muted }}>+</div>
              <div style={{ fontSize:'13px', color:C.muted }}>New note</div>
            </div>

            {notes.map(note => (
              <div key={note.id}
                onClick={() => openNote(note)}
                style={{ background:C.card, borderRadius:'13px', padding:'18px',
                  border:`1px solid ${selected.has(note.id) ? C.nest : note.isPinned ? C.amber+'55' : C.border}`,
                  cursor:'pointer', display:'flex', flexDirection:'column', gap:'8px',
                  transition:'all 0.15s', minHeight:'140px',
                  boxShadow: selected.has(note.id) ? `0 0 0 2px ${C.nest}33` : 'none' }}
                onMouseEnter={e => { if (!selected.has(note.id)) (e.currentTarget as HTMLElement).style.borderColor = C.nest+'66'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = selected.has(note.id) ? C.nest : note.isPinned ? C.amber+'55' : C.border; }}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  {selectMode && (
                    <div style={{ width:'16px', height:'16px', borderRadius:'4px', flexShrink:0,
                      border:`2px solid ${selected.has(note.id) ? C.nest : C.border}`,
                      background: selected.has(note.id) ? C.nest : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      marginRight:'8px', marginTop:'2px' }}>
                      {selected.has(note.id) &&
                        <span style={{ color:C.bg, fontSize:'10px' }}>✓</span>}
                    </div>
                  )}
                  <div style={{ fontWeight:'700', fontSize:'14px', color:C.cream,
                    flex:1, lineHeight:'1.3' }}>
                    {note.isPinned && <span style={{ marginRight:'4px' }}>📌</span>}
                    {note.title || 'Untitled'}
                  </div>
                  {!selectMode && (
                    <div style={{ display:'flex', gap:'2px', flexShrink:0 }}
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => handlePin(note)}
                        style={{ background:'none', border:'none', cursor:'pointer',
                          color: note.isPinned ? C.amber : C.muted, fontSize:'12px', padding:'2px 4px' }}>
                        📌
                      </button>
                      <button onClick={() => handleDelete(note.id)}
                        style={{ background:'none', border:'none', cursor:'pointer',
                          color:C.muted, fontSize:'12px', padding:'2px 4px' }}>
                        🗑
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ fontSize:'12px', color:C.muted, lineHeight:'1.6', flex:1,
                  overflow:'hidden', display:'-webkit-box',
                  WebkitLineClamp:3, WebkitBoxOrient:'vertical' }}>
                  {note.content || <em>Empty note — click to open</em>}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', paddingTop:'6px',
                  borderTop:`1px solid ${C.border}` }}>
                  {note.topic
                    ? <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'20px',
                        background:C.nest+'22', color:C.nestGlow,
                        fontFamily:"'DM Mono', monospace" }}>{note.topic}</span>
                    : <span />}
                  <span style={{ fontSize:'10px', color:C.muted,
                    fontFamily:"'DM Mono', monospace" }}>
                    {fmtDate(note.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

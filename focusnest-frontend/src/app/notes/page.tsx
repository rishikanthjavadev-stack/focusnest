'use client';
import { useState, useEffect, useCallback } from 'react';
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

const inp: React.CSSProperties = {
  width:'100%', background:C.bg, border:`1px solid ${C.border}`,
  borderRadius:'10px', padding:'11px 14px', color:C.cream, fontSize:'13px',
  outline:'none', boxSizing:'border-box', fontFamily:"'Outfit', sans-serif",
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
  const [notes, setNotes]         = useState<Note[]>([]);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editNote, setEditNote]   = useState<Note | null>(null);
  const [toast, setToast]         = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [showExport, setShowExport] = useState(false);
  const [form, setForm] = useState({
    title:'', content:'', tags:'', topic:'', isPinned:false, isResearch:false,
  });

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
    loadNotes();
  }, [router, loadNotes]);

  const resetForm = () => {
    setForm({ title:'', content:'', tags:'', topic:'', isPinned:false, isResearch:false });
    setEditNote(null); setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Title is required'); return; }
    const payload = {
      title: form.title, content: form.content,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      topic: form.topic, isPinned: form.isPinned, isResearch: form.isResearch,
    };
    try {
      if (editNote) {
        const { data } = await api.put(`/notes/${editNote.id}`, payload);
        setNotes(ns => ns.map(n => n.id === editNote.id ? { ...n, ...data, tags: payload.tags, topic: payload.topic } : n));
        showToast('✅ Note updated!');
      } else {
        const { data } = await api.post('/notes', payload);
        setNotes(ns => [{ ...data, tags: payload.tags, topic: payload.topic }, ...ns]);
        showToast('✅ Note saved!');
      }
      resetForm();
    } catch { showToast('Failed to save note'); }
  };

  const handleEdit = (n: Note) => {
    setEditNote(n);
    setForm({ title:n.title, content:n.content, tags:(n.tags||[]).join(', '),
      topic:n.topic||'', isPinned:n.isPinned, isResearch:n.isResearch });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/notes/${id}`);
    setNotes(ns => ns.filter(n => n.id !== id));
    showToast('🗑 Note deleted');
  };

  const handlePin = async (n: Note) => {
    await api.put(`/notes/${n.id}`, { ...n, isPinned: !n.isPinned });
    setNotes(ns => ns.map(x => x.id === n.id ? { ...x, isPinned: !n.isPinned } : x)
      .sort((a,b) => (b.isPinned?1:0) - (a.isPinned?1:0)));
    showToast(n.isPinned ? 'Unpinned' : '📌 Pinned!');
  };

  const toggleSelect = (id: number) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const selectAll = () => setSelected(
    selected.size === filtered.length ? new Set() : new Set(filtered.map(n => n.id))
  );

  const handleBulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} note(s)?`)) return;
    await Promise.all([...selected].map(id => api.delete(`/notes/${id}`)));
    setNotes(ns => ns.filter(n => !selected.has(n.id)));
    setSelected(new Set()); setSelectMode(false);
    showToast(`🗑 ${selected.size} note(s) deleted`);
  };

  const doExport = (fmt: 'txt'|'md'|'json', subset: Note[]) => {
    let text = '', mime = 'text/plain', ext = fmt;
    if (fmt === 'txt') {
      text = subset.map(n =>
        `TITLE: ${n.title}\nTOPIC: ${n.topic||'General'}\nTAGS: ${(n.tags||[]).join(', ')}\nDATE: ${new Date(n.createdAt).toLocaleDateString()}\n\n${n.content}`
      ).join('\n\n' + '='.repeat(50) + '\n\n');
    } else if (fmt === 'md') {
      text = '# FocusNest Notes\n\n' + subset.map(n =>
        `## ${n.title}\n\n` +
        (n.topic ? `**Topic:** ${n.topic}  \n` : '') +
        (n.tags?.length ? `**Tags:** ${n.tags.join(', ')}  \n` : '') +
        `**Date:** ${new Date(n.createdAt).toLocaleDateString()}\n\n${n.content||'_No content_'}`
      ).join('\n\n---\n\n');
      mime = 'text/markdown';
    } else {
      text = JSON.stringify(subset, null, 2);
      mime = 'application/json';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = `focusnest-notes.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
    setShowExport(false);
    showToast(`📥 ${subset.length} note(s) exported as ${fmt.toUpperCase()}!`);
  };

  const topics = Array.from(new Set(notes.map(n => n.topic).filter(Boolean)));
  const filtered = notes.filter(n =>
    (filter === 'all' ? true : filter === 'pinned' ? n.isPinned : n.topic === filter)
  );

  const exportFormats: ['txt'|'md'|'json', string, string][] = [
    ['txt', '📄 Plain Text (.txt)', 'Simple readable format'],
    ['md',  '📝 Markdown (.md)',    'For Obsidian, Notion, etc'],
    ['json','🗂 JSON (.json)',       'Raw data backup'],
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'Outfit', sans-serif", color:C.cream }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999,
          background:C.card, border:`1px solid ${C.nest}`, borderRadius:'12px',
          padding:'13px 18px', fontSize:'13px', fontWeight:'600',
          boxShadow:`0 0 24px ${C.nest}33` }}>{toast}</div>
      )}

      {/* Top bar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:'18px' }}>←</button>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'7px',
              background:`linear-gradient(135deg,${C.nest},${C.sage})`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>🪺</div>
            <span style={{ fontFamily:"'Fraunces', serif", fontSize:'15px', fontWeight:'700' }}>FocusNest</span>
          </div>
          <span style={{ color:C.muted, fontSize:'13px' }}>/ Notes</span>
        </div>

        {/* Toolbar */}
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {/* Select toggle */}
          <button onClick={() => { setSelectMode(v => !v); setSelected(new Set()); }}
            style={{ padding:'8px 14px', borderRadius:'9px',
              border:`1px solid ${selectMode ? C.nest : C.border}`,
              background: selectMode ? C.nest+'22' : 'transparent',
              color: selectMode ? C.nestGlow : C.muted,
              cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
            {selectMode ? `✓ ${selected.size} selected` : '☑ Select'}
          </button>

          {/* Bulk delete */}
          {selectMode && selected.size > 0 && (
            <button onClick={handleBulkDelete}
              style={{ padding:'8px 14px', borderRadius:'9px',
                border:'1px solid #c0392b44', background:'#c0392b18',
                color:C.red, cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
              🗑 Delete ({selected.size})
            </button>
          )}

          {/* Export dropdown */}
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowExport(v => !v)}
              style={{ padding:'8px 14px', borderRadius:'9px',
                border:`1px solid ${selectMode && selected.size > 0 ? C.nest+'66' : C.border}`,
                background: selectMode && selected.size > 0 ? C.nest+'22' : 'transparent',
                color: selectMode && selected.size > 0 ? C.nestGlow : C.muted,
                cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
              ⬇ {selectMode && selected.size > 0 ? `Export (${selected.size})` : 'Export All'} ▾
            </button>
            {showExport && (
              <div style={{ position:'absolute', top:'38px', right:0, zIndex:200,
                background:C.card, border:`1px solid ${C.border}`, borderRadius:'10px',
                overflow:'hidden', minWidth:'190px', boxShadow:'0 8px 32px #00000088' }}>
                {exportFormats.map(([fmt, label, desc]) => (
                  <button key={fmt}
                    onClick={() => doExport(fmt, selectMode && selected.size > 0
                      ? notes.filter(n => selected.has(n.id)) : notes)}
                    style={{ width:'100%', padding:'11px 16px', background:'transparent',
                      border:'none', borderBottom:`1px solid ${C.border}`,
                      color:C.cream, cursor:'pointer', textAlign:'left',
                      fontFamily:"'Outfit', sans-serif" }}>
                    <div style={{ fontSize:'13px', fontWeight:'600' }}>{label}</div>
                    <div style={{ fontSize:'10px', color:C.muted, marginTop:'2px' }}>{desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding:'8px 16px', borderRadius:'9px', border:'none',
              background:`linear-gradient(135deg,${C.nest},${C.sage})`,
              color:C.bg, cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
            + New Note
          </button>
        </div>
      </div>

      <div style={{ padding:'24px 28px' }}>
        {/* Search + filters */}
        <div style={{ display:'flex', gap:'12px', marginBottom:'20px', alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search notes..." style={{ ...inp, maxWidth:'320px' }} />
          <div style={{ display:'flex', gap:'7px', flexWrap:'wrap' }}>
            {(['all','pinned',...topics] as string[]).map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding:'7px 13px', borderRadius:'20px',
                  border:`1.5px solid ${filter===t?C.nest:C.border}`,
                  background: filter===t?C.nest+'22':C.surface,
                  color: filter===t?C.nestGlow:C.muted,
                  cursor:'pointer', fontSize:'12px', fontWeight:filter===t?'700':'500' }}>
                {t==='all'?'All':t==='pinned'?'📌 Pinned':t}
              </button>
            ))}
          </div>
          <span style={{ marginLeft:'auto', fontSize:'11px', color:C.muted,
            fontFamily:"'DM Mono', monospace" }}>
            {filtered.length} note{filtered.length!==1?'s':''}
          </span>
        </div>

        {/* Select all bar */}
        {selectMode && filtered.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px',
            padding:'10px 16px', background:C.surface, borderRadius:'10px',
            border:`1px solid ${C.border}` }}>
            <div onClick={selectAll}
              style={{ width:'18px', height:'18px', borderRadius:'5px', cursor:'pointer',
                border:`2px solid ${selected.size===filtered.length?C.nest:C.border}`,
                background:selected.size===filtered.length?C.nest:'transparent',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {selected.size===filtered.length &&
                <span style={{ color:C.bg, fontSize:'11px', fontWeight:'700' }}>✓</span>}
            </div>
            <span style={{ fontSize:'12px', color:C.muted }}>
              {selected.size===0 ? 'Click to select all' : `${selected.size} of ${filtered.length} selected`}
            </span>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())}
                style={{ marginLeft:'auto', background:'none', border:'none',
                  color:C.muted, cursor:'pointer', fontSize:'12px' }}>
                Clear
              </button>
            )}
          </div>
        )}

        {/* Note form */}
        {showForm && (
          <div style={{ background:C.card, borderRadius:'14px', padding:'22px',
            border:`1px solid ${C.nest}44`, marginBottom:'24px' }}>
            <div style={{ fontSize:'13px', fontWeight:'700', color:C.nestGlow, marginBottom:'16px' }}>
              {editNote ? '✏️ Edit Note' : '📝 New Note'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
              <div>
                <label style={{ display:'block', marginBottom:'5px', fontSize:'10px',
                  fontFamily:"'DM Mono',monospace", color:C.muted, letterSpacing:'1.5px', fontWeight:'700' }}>
                  TITLE
                </label>
                <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                  placeholder="Note title..." style={inp} />
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'5px', fontSize:'10px',
                  fontFamily:"'DM Mono',monospace", color:C.muted, letterSpacing:'1.5px', fontWeight:'700' }}>
                  TOPIC
                </label>
                <input value={form.topic} onChange={e => setForm(f=>({...f,topic:e.target.value}))}
                  placeholder="Machine Learning, Python..." style={inp} />
              </div>
            </div>
            <div style={{ marginBottom:'10px' }}>
              <label style={{ display:'block', marginBottom:'5px', fontSize:'10px',
                fontFamily:"'DM Mono',monospace", color:C.muted, letterSpacing:'1.5px', fontWeight:'700' }}>
                CONTENT
              </label>
              <textarea value={form.content} onChange={e => setForm(f=>({...f,content:e.target.value}))}
                placeholder="Write your insight, key concept, or research note..."
                rows={5} style={{ ...inp, resize:'vertical', lineHeight:'1.7' }} />
            </div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', marginBottom:'5px', fontSize:'10px',
                fontFamily:"'DM Mono',monospace", color:C.muted, letterSpacing:'1.5px', fontWeight:'700' }}>
                TAGS (comma separated)
              </label>
              <input value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))}
                placeholder="ML, Optimization, Neural Networks..." style={inp} />
            </div>
            <div style={{ display:'flex', gap:'16px', marginBottom:'16px' }}>
              {([['isPinned','📌 Pin this note'],['isResearch','🔬 Research note']] as const).map(([key,label]) => (
                <label key={key} style={{ display:'flex', alignItems:'center', gap:'8px',
                  cursor:'pointer', fontSize:'13px', color:C.muted }}>
                  <div onClick={() => setForm(f=>({...f,[key]:!f[key]}))}
                    style={{ width:'18px', height:'18px', borderRadius:'5px', cursor:'pointer',
                      border:`2px solid ${form[key]?C.nest:C.border}`,
                      background:form[key]?C.nest:'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {form[key] && <span style={{ color:C.bg, fontSize:'11px', fontWeight:'700' }}>✓</span>}
                  </div>
                  {label}
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleSave}
                style={{ padding:'10px 22px', borderRadius:'10px', border:'none',
                  background:`linear-gradient(135deg,${C.nest},${C.sage})`,
                  color:C.bg, cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>
                {editNote ? 'Update Note' : 'Save Note'}
              </button>
              <button onClick={resetForm}
                style={{ padding:'10px 16px', borderRadius:'10px',
                  border:`1px solid ${C.border}`, background:'transparent',
                  color:C.muted, cursor:'pointer', fontSize:'13px' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes grid */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:C.muted }}>Loading notes...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📝</div>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:'20px',
              color:C.cream, marginBottom:'8px' }}>No notes yet</div>
            <div style={{ fontSize:'13px', color:C.muted, marginBottom:'20px' }}>
              Capture your first insight or key concept
            </div>
            <button onClick={() => setShowForm(true)}
              style={{ padding:'11px 22px', borderRadius:'10px', border:'none',
                background:`linear-gradient(135deg,${C.nest},${C.sage})`,
                color:C.bg, cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>
              + Create First Note
            </button>
          </div>
        ) : (
          <div style={{ display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px' }}>
            {filtered.map(note => (
              <div key={note.id}
                onClick={() => selectMode && toggleSelect(note.id)}
                style={{ background:C.card, borderRadius:'13px', padding:'18px',
                  border:`1px solid ${selected.has(note.id)?C.nest:note.isPinned?C.amber+'55':C.border}`,
                  display:'flex', flexDirection:'column', gap:'10px',
                  cursor:selectMode?'pointer':'default',
                  boxShadow:selected.has(note.id)?`0 0 0 2px ${C.nest}44`:'none',
                  transition:'all 0.15s' }}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                  {/* Checkbox in select mode */}
                  {selectMode && (
                    <div style={{ width:'18px', height:'18px', borderRadius:'5px', flexShrink:0,
                      border:`2px solid ${selected.has(note.id)?C.nest:C.border}`,
                      background:selected.has(note.id)?C.nest:'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center', marginTop:'2px' }}>
                      {selected.has(note.id) &&
                        <span style={{ color:C.bg, fontSize:'11px', fontWeight:'700' }}>✓</span>}
                    </div>
                  )}
                  <div style={{ fontWeight:'700', fontSize:'14px',
                    color:note.isPinned?C.amber:C.cream, flex:1, lineHeight:'1.3' }}>
                    {note.isPinned && <span style={{ marginRight:'5px' }}>📌</span>}
                    {note.isResearch && <span style={{ marginRight:'5px' }}>🔬</span>}
                    {note.title}
                  </div>
                  {!selectMode && (
                    <div style={{ display:'flex', gap:'2px', flexShrink:0 }}>
                      <button onClick={() => handlePin(note)}
                        style={{ background:'none', border:'none', cursor:'pointer',
                          color:note.isPinned?C.amber:C.muted, fontSize:'14px', padding:'3px 5px' }}>📌</button>
                      <button onClick={() => handleEdit(note)}
                        style={{ background:'none', border:'none', cursor:'pointer',
                          color:C.muted, fontSize:'13px', padding:'3px 5px' }}>✏️</button>
                      <button onClick={() => handleDelete(note.id)}
                        style={{ background:'none', border:'none', cursor:'pointer',
                          color:C.muted, fontSize:'13px', padding:'3px 5px' }}>🗑</button>
                    </div>
                  )}
                </div>

                <div style={{ fontSize:'12px', color:C.muted, lineHeight:'1.6',
                  overflow:'hidden', display:'-webkit-box',
                  WebkitLineClamp:3, WebkitBoxOrient:'vertical' }}>
                  {note.content || <em>No content</em>}
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                    {note.tags.map(tag => (
                      <span key={tag} style={{ fontSize:'10px', padding:'2px 8px',
                        borderRadius:'20px', background:C.sage+'22', color:C.sage,
                        border:`1px solid ${C.sage}33`, fontFamily:"'DM Mono', monospace",
                        fontWeight:'600' }}>{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  paddingTop:'8px', borderTop:`1px solid ${C.border}` }}>
                  {note.topic
                    ? <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px',
                        background:C.nest+'22', color:C.nestGlow, border:`1px solid ${C.nest}33`,
                        fontWeight:'600', fontFamily:"'DM Mono', monospace" }}>{note.topic}</span>
                    : <span />}
                  <span style={{ fontSize:'10px', color:C.muted, fontFamily:"'DM Mono', monospace" }}>
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

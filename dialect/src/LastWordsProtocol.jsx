import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const STEPS = [
  { id: 'numbers',   label: 'Numbers',          icon: '①',
    prompt: 'Count slowly from one to ten.',
    sub:    'Take your time. Say each number clearly.' ,
    why:    'Number systems reveal how a language quantifies the world.' },
  { id: 'colours',   label: 'Colour words',      icon: '②',
    prompt: 'Name the colours you see — sky, earth, fire, shadow.',
    sub:    'Any colours that come naturally. No wrong answers.',
    why:    'Colour vocabulary maps how a culture perceives the visible world.' },
  { id: 'body',      label: 'Body parts',        icon: '③',
    prompt: 'Head, hand, heart, eyes, feet — name them slowly.',
    sub:    'These words survive longest in any living language.',
    why:    'Body part words are the deepest layer of any vocabulary.' },
  { id: 'family',    label: 'Family words',      icon: '④',
    prompt: 'How do you say mother, father, grandmother, grandfather, cousin?',
    sub:    'Include any special terms your family uses.',
    why:    'Kinship words encode how a society organises its people.' },
  { id: 'nature',    label: 'Nature & weather',  icon: '⑤',
    prompt: 'Rain, sun, river, mountain, wind, night — speak them as they come.',
    sub:    'And any others that feel important to where you\'re from.',
    why:    'Environmental words carry irreplaceable ecological knowledge.' },
  { id: 'emotions',  label: 'Emotional words',   icon: '⑥',
    prompt: 'How do you say grief? Joy? The longing for a place you love?',
    sub:    'Let the words arrive — describe the feeling if you can.',
    why:    'Emotional nuance cannot be translated. Only heard.' },
  { id: 'proverbs',  label: 'A proverb',         icon: '⑦',
    prompt: 'Share a saying or proverb your community uses.',
    sub:    'Say it first, then explain what it means in your own words.',
    why:    'Proverbs hold compressed wisdom no dictionary can capture.' },
  { id: 'story',     label: 'A memory',          icon: '⑧',
    prompt: 'Tell something you remember from when you were young.',
    sub:    'Speak naturally — no performance needed. Just talk.',
    why:    'Natural speech reveals the living rhythm of the language.' },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;800&display=swap');
  @keyframes stepGlow { 0%,100% { box-shadow:0 0 12px rgba(167,139,250,0.3); } 50% { box-shadow:0 0 22px rgba(167,139,250,0.65); } }
  @keyframes recPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(0.88); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .lwp-step-done  { animation: stepGlow 2.8s ease-in-out infinite; }
  .lwp-rec-dot    { animation: recPulse 1.1s ease-in-out infinite; }
  .lwp-fade       { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1); }
  .lwp-btn { font-family:'Space Mono',monospace; border:none; border-radius:9px; cursor:pointer; transition:all 0.18s; }
  .lwp-btn:hover:not(:disabled) { filter:brightness(1.15); transform:translateY(-1px); }
  .lwp-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .lwp-input { background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.35); border-radius:8px; color:#f0eee8; font-family:'Space Mono',monospace; font-size:13px; padding:10px 14px; outline:none; width:100%; box-sizing:border-box; transition:border 0.2s; }
  .lwp-input:focus { border-color:rgba(167,139,250,0.7); }
  .lwp-input::placeholder { color:#4a4a5a; }
`;

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function LastWordsProtocol({ initialLanguage = '' }) {
  const [phase, setPhase]         = useState('intro');   // intro | steps | done
  const [activeIdx, setActiveIdx] = useState(0);
  const [stepPhase, setStepPhase] = useState('ready');   // ready | recording | recorded
  const [completed, setCompleted] = useState(new Set());
  const [language, setLanguage]   = useState(initialLanguage);
  const [location, setLocation]   = useState('');
  const [elapsed, setElapsed]     = useState(0);
  const [saving, setSaving]       = useState(false);

  const mrRef          = useRef(null);
  const chunksRef      = useRef([]);
  const blobsRef       = useRef({});
  const timerRef       = useRef(null);
  const uploadedUrls   = useRef({});   // stepId → public audio URL

  const step = STEPS[activeIdx];
  const done = completed.size;
  const total = STEPS.length;

  // SVG progress ring
  const R = 38;
  const C = 2 * Math.PI * R;
  const ringPct = done / total;

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (initialLanguage) setLanguage(initialLanguage);
  }, [initialLanguage]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        blobsRef.current[step.id] = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        setStepPhase('recorded');
      };
      mr.start();
      mrRef.current = mr;
      setStepPhase('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    } catch {
      alert('Microphone access is needed. Please allow it in your browser settings.');
    }
  };

  const stopRec = () => {
    mrRef.current?.stop();
    clearInterval(timerRef.current);
  };

  const saveStep = async () => {
    const blob = blobsRef.current[step.id];
    if (blob && supabase) {
      try {
        const path = `protocol/${language.replace(/\s+/g, '_')}_${step.id}_${Date.now()}.webm`;
        await supabase.storage.from('recordings').upload(path, blob, { contentType: 'audio/webm', upsert: true });
        const { data: { publicUrl } } = supabase.storage.from('recordings').getPublicUrl(path);
        uploadedUrls.current[step.id] = publicUrl;
      } catch { /* non-fatal — step still counts as completed */ }
    }
    const next = new Set([...completed, step.id]);
    setCompleted(next);
    if (activeIdx < total - 1) {
      setActiveIdx(activeIdx + 1);
      setStepPhase('ready');
      setElapsed(0);
    } else {
      await finish(next);
    }
  };

  const skipStep = () => {
    if (activeIdx < total - 1) {
      setActiveIdx(activeIdx + 1);
      setStepPhase('ready');
      setElapsed(0);
    } else {
      finish(completed);
    }
  };

  const finish = async (doneSet) => {
    setSaving(true);
    if (supabase && language) {
      try {
        // Parse "Town, Country" from the free-text location field
        const parts = location.split(',').map(p => p.trim()).filter(Boolean);
        const country = parts.length > 1 ? parts[parts.length - 1] : (parts[0] || 'Unknown');
        const town    = parts.length > 1 ? parts[0] : null;

        // Geocode so pins appear on the globe
        let lat = null, lng = null;
        try {
          const q = encodeURIComponent(location || country);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
            { headers: { Accept: 'application/json' } }
          );
          const geo = await res.json();
          if (geo.length > 0) { lat = parseFloat(geo[0].lat); lng = parseFloat(geo[0].lon); }
        } catch { /* geocoding failure is non-fatal */ }

        // One row per completed step that has a saved audio URL
        const rows = STEPS
          .filter(s => doneSet.has(s.id) && uploadedUrls.current[s.id])
          .map(s => ({
            language_name: language,
            country,
            town,
            latitude:  lat,
            longitude: lng,
            description: `[Last Words Protocol · ${s.label}] ${s.why}`,
            audio_url: uploadedUrls.current[s.id],
            consent_given: true,
          }));

        if (rows.length > 0) {
          await supabase.from('community_uploads').insert(rows);
        } else {
          // Fallback: summary row with no audio if storage failed for every step
          await supabase.from('community_uploads').insert({
            language_name: language,
            country,
            town,
            latitude:  lat,
            longitude: lng,
            description: `Last Words Protocol — ${doneSet.size}/${total} categories recorded (audio pending)`,
            consent_given: true,
          });
        }
      } catch { /* non-fatal */ }
    }
    setSaving(false);
    setPhase('done');
  };

  // ─── Intro ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={outerStyle}>
      <style>{CSS}</style>
      <div className="lwp-fade" style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>◉</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: '#f0eee8', marginBottom: 8 }}>
            Last Words Protocol
          </div>
          <div style={{ fontSize: 12, color: '#7a7a8c', lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
            A guided recording session designed by linguists to capture the most
            irreplaceable parts of a language first.
            <span style={{ color: '#a78bfa' }}> About 5 minutes.</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,58,237,0.07)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              <span style={{ color: '#7c3aed', fontSize: 14 }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: '#9090a8', fontFamily: "'Space Mono',monospace" }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#7a7a8c', letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 6 }}>
            Your language
          </div>
          <input
            className="lwp-input"
            placeholder="e.g. Breton, Võro, Lakota…"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: '#7a7a8c', letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 6 }}>
            Where you're from
          </div>
          <input
            className="lwp-input"
            placeholder="e.g. Quimper, France"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <button
          className="lwp-btn"
          disabled={!language.trim()}
          onClick={() => setPhase('steps')}
          style={{
            width: '100%', padding: '14px 0',
            background: language.trim()
              ? 'linear-gradient(135deg,#7c3aed,#4c1d95)'
              : 'rgba(124,58,237,0.2)',
            color: '#f0eee8', fontSize: 13, letterSpacing: '0.5px',
          }}
        >
          Begin recording
        </button>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 10, color: '#3a3a4a', lineHeight: 1.6 }}>
          Your voice will be stored in our archive.<br />
          You can skip any step at any time.
        </div>
      </div>
    </div>
  );

  // ─── Done ──────────────────────────────────────────────────────────────────
  if (phase === 'done') return (
    <div style={outerStyle}>
      <style>{CSS}</style>
      <div className="lwp-fade" style={{ ...cardStyle, textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>◉</div>
        <div style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24,
          color: '#f0eee8', marginBottom: 12, lineHeight: 1.3,
        }}>
          You've just preserved<br />something irreplaceable.
        </div>
        <div style={{ fontSize: 12, color: '#9090a8', lineHeight: 1.8, marginBottom: 24 }}>
          {done} of {total} categories recorded for <span style={{ color: '#c4b5fd' }}>{language}</span>.
          {done > 0 && ' Your recordings have been added to our archive.'}
        </div>
        {/* Completed steps */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {STEPS.map(s => (
            <div key={s.id} className={completed.has(s.id) ? 'lwp-step-done' : ''} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 10,
              fontFamily: "'Space Mono',monospace",
              background: completed.has(s.id) ? 'rgba(167,139,250,0.18)' : 'rgba(60,60,80,0.15)',
              border: `1px solid ${completed.has(s.id) ? 'rgba(167,139,250,0.5)' : 'rgba(80,80,100,0.2)'}`,
              color: completed.has(s.id) ? '#c4b5fd' : '#3a3a4a',
            }}>
              {completed.has(s.id) ? '✓ ' : ''}{s.label}
            </div>
          ))}
        </div>
        <button
          className="lwp-btn"
          onClick={() => { setPhase('intro'); setActiveIdx(0); setCompleted(new Set()); setStepPhase('ready'); setLanguage(''); setLocation(''); blobsRef.current = {}; uploadedUrls.current = {}; }}
          style={{ padding: '11px 32px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', fontSize: 12 }}
        >
          Record another language
        </button>
      </div>
    </div>
  );

  // ─── Steps ─────────────────────────────────────────────────────────────────
  return (
    <div style={outerStyle}>
      <style>{CSS}</style>
      <div style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 860, height: '100%', maxHeight: 620 }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: 210, flexShrink: 0,
          background: 'rgba(10,8,18,0.96)',
          borderRight: '1px solid rgba(124,58,237,0.18)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 0',
          borderRadius: '16px 0 0 16px',
        }}>
          {/* Progress ring */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <svg width={96} height={96} viewBox="0 0 96 96">
              <circle cx={48} cy={48} r={R} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth={7} />
              <circle cx={48} cy={48} r={R} fill="none"
                stroke={done === total ? '#f5a623' : '#7c3aed'}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - ringPct)}
                transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
              />
              <text x={48} y={44} textAnchor="middle" fill="#f0eee8" fontSize={18} fontWeight={700} fontFamily="Syne,sans-serif">{done}</text>
              <text x={48} y={60} textAnchor="middle" fill="#5a5a70" fontSize={10} fontFamily="Space Mono,monospace">of {total}</text>
            </svg>
            <div style={{ fontSize: 10, color: '#5a5a70', fontFamily: "'Space Mono',monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>
              {language}
            </div>
          </div>

          {/* Step list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
            {STEPS.map((s, i) => {
              const isDone    = completed.has(s.id);
              const isActive  = i === activeIdx && !isDone;
              return (
                <div
                  key={s.id}
                  className={isDone ? 'lwp-step-done' : ''}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                    background: isActive ? 'rgba(124,58,237,0.2)' : isDone ? 'rgba(167,139,250,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(124,58,237,0.45)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 13, color: isDone ? '#a78bfa' : isActive ? '#c4b5fd' : '#3a3a4a' }}>
                    {isDone ? '✓' : s.icon}
                  </span>
                  <span style={{
                    fontSize: 10.5, fontFamily: "'Space Mono',monospace",
                    color: isDone ? '#a78bfa' : isActive ? '#f0eee8' : '#4a4a5a',
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main panel ── */}
        <div className="lwp-fade" key={activeIdx} style={{
          flex: 1,
          background: 'linear-gradient(160deg,#0f0a1e 0%,#130d24 100%)',
          borderRadius: '0 16px 16px 0',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '36px 40px',
        }}>
          {/* Step header */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#5a5a70', fontFamily: "'Space Mono',monospace", letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Step {activeIdx + 1} of {total}
            </span>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#f0eee8', marginBottom: 6 }}>
            {step.label}
          </div>

          {/* Prompt */}
          <div style={{
            fontSize: 16, color: '#c4b5fd', lineHeight: 1.65, marginBottom: 8, fontStyle: 'italic',
          }}>
            "{step.prompt}"
          </div>
          <div style={{ fontSize: 11, color: '#5a5a70', marginBottom: 28, lineHeight: 1.6 }}>
            {step.sub}
          </div>

          {/* Record controls */}
          {stepPhase === 'ready' && (
            <button className="lwp-btn" onClick={startRec} style={{
              padding: '14px 0', width: 200,
              background: 'linear-gradient(135deg,#7c3aed,#4c1d95)',
              color: '#f0eee8', fontSize: 13, letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <span>●</span> Start recording
            </button>
          )}

          {stepPhase === 'recording' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="lwp-btn" onClick={stopRec} style={{
                padding: '14px 24px',
                background: 'rgba(239,68,68,0.18)',
                border: '1px solid rgba(239,68,68,0.45)',
                color: '#fca5a5', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span className="lwp-rec-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                Stop  {fmt(elapsed)}
              </button>
              <span style={{ fontSize: 10, color: '#5a5a70', fontFamily: "'Space Mono',monospace" }}>
                recording…
              </span>
            </div>
          )}

          {stepPhase === 'recorded' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="lwp-btn" onClick={saveStep} disabled={saving} style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg,#7c3aed,#4c1d95)',
                color: '#f0eee8', fontSize: 12,
              }}>
                {saving ? 'Saving…' : 'Save & continue →'}
              </button>
              <button className="lwp-btn" onClick={startRec} style={{
                padding: '12px 18px',
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#7a7a8c', fontSize: 11,
              }}>
                Re-record
              </button>
            </div>
          )}

          {/* Skip */}
          {stepPhase !== 'recording' && (
            <button onClick={skipStep} style={{
              marginTop: 14, background: 'none', border: 'none',
              color: '#3a3a4a', fontSize: 10, cursor: 'pointer',
              fontFamily: "'Space Mono',monospace", letterSpacing: '0.5px',
              textAlign: 'left', padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#6b6b80'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a3a4a'}
            >
              skip this step →
            </button>
          )}

          {/* Why this matters */}
          <div style={{
            marginTop: 'auto', paddingTop: 24,
            borderTop: '1px solid rgba(124,58,237,0.12)',
          }}>
            <div style={{ fontSize: 9, color: '#3a3a4a', letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 5 }}>
              Why this matters
            </div>
            <div style={{ fontSize: 11, color: '#5a5a70', lineHeight: 1.65, fontStyle: 'italic' }}>
              {step.why}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const outerStyle = {
  width: '100%', height: '100%',
  background: 'radial-gradient(ellipse at 50% 30%, rgba(60,20,120,0.18) 0%, #0a0812 70%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Space Mono',monospace",
  padding: '20px',
  boxSizing: 'border-box',
};

const cardStyle = {
  background: 'linear-gradient(160deg,#0f0a1e 0%,#130d24 100%)',
  border: '1px solid rgba(124,58,237,0.28)',
  borderRadius: 16,
  padding: '36px 40px',
  width: '100%',
  maxWidth: 520,
  boxShadow: '0 20px 80px rgba(0,0,0,0.7)',
};

import React, { useState, useRef, useEffect } from 'react';

const POINTS = 180;

function computeEnvelope(audioBuffer) {
  const data  = audioBuffer.getChannelData(0);
  const block = Math.max(1, Math.floor(data.length / POINTS));
  const env   = new Float32Array(POINTS);
  for (let i = 0; i < POINTS; i++) {
    let s = 0;
    for (let j = 0; j < block; j++) s += Math.abs(data[i * block + j] ?? 0);
    env[i] = s / block;
  }
  const max = Math.max(...env, 1e-9);
  for (let i = 0; i < POINTS; i++) env[i] /= max;
  return env;
}

function drawWave(canvas, envelope, color, dim = false) {
  if (!canvas || !envelope) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, mid = H / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.moveTo(0, mid);
  for (let i = 0; i < POINTS; i++) {
    ctx.lineTo((i / (POINTS - 1)) * W, mid - envelope[i] * mid * 0.85);
  }
  for (let i = POINTS - 1; i >= 0; i--) {
    ctx.lineTo((i / (POINTS - 1)) * W, mid + envelope[i] * mid * 0.85);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, W, 0);
  const a = dim ? '33' : 'aa';
  const b = dim ? '55' : 'ee';
  g.addColorStop(0,   color + '33');
  g.addColorStop(0.5, color + b);
  g.addColorStop(1,   color + '33');
  ctx.fillStyle = g;
  ctx.fill();
}

function pearson(a, b) {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma, db = b[i] - mb;
    cov += da * db; va += da * da; vb += db * db;
  }
  return cov / (Math.sqrt(va * vb) + 1e-9);
}

const PRONUNCIATION_GUIDES = {
  'Welsh': {
    overview: "Stress almost always falls on the second-to-last syllable. Welsh vowels are pure — no gliding.",
    sounds: [
      { pattern: 'll',      guide: "No English match. Tongue on roof of mouth, blow air out the sides — a hissing lateral." },
      { pattern: 'ch',      guide: "Like Scottish 'loch' — deep in the throat, never 'ch' as in 'church'." },
      { pattern: 'dd',      guide: "Voiced 'th' as in 'the', never a 'd' sound." },
      { pattern: 'f',       guide: "Sounds like 'v' — 'fach' is pronounced 'vach'." },
      { pattern: 'ff',      guide: "Standard 'f' sound — 'ffwl' sounds like 'fool'." },
      { pattern: 'rh',      guide: "Breathed rolled 'r' — whisper while trilling the tip of your tongue." },
      { pattern: 'w / y',   guide: "Both act as vowels. 'w' = 'oo', 'y' = 'uh' (unstressed) or 'ee' (stressed)." },
    ],
  },
  'Irish (Gaeilge)': {
    overview: "Stress lands on the first syllable in most dialects. Consonants come in broad (next to a/o/u) and slender (next to e/i) forms — this changes their sound.",
    sounds: [
      { pattern: 'bh / mh', guide: "'v' or 'w' sound — 'bhfuil' sounds like 'will'." },
      { pattern: 'th / sh', guide: "Both reduce to a plain 'h' — the 't' and 's' are silent." },
      { pattern: 'ph',      guide: "'f' sound — lenition turns 'p' into 'f'." },
      { pattern: 'fh',      guide: "Completely silent — 'fhear' sounds like 'ar'." },
      { pattern: 'ao',      guide: "Long 'ee' with relaxed lips — halfway between 'ee' and 'uh'." },
      { pattern: 'broad r', guide: "Strong back-of-tongue trill, like a rolled 'r' with more friction." },
    ],
  },
  'Geordie': {
    overview: "Geordie rhythm is punchy and musical. Vowels shift significantly from standard English — don't fight them, lean in.",
    sounds: [
      { pattern: 'a (face, name)', guide: "Flat 'a' as in 'cat' — 'face' sounds closer to 'fass'." },
      { pattern: 'ow (town, down)', guide: "'oon' sound — 'town' becomes 'toon', 'brown' becomes 'broon'." },
      { pattern: 'oo (book, cook)', guide: "Fully rounded — 'book' sounds like 'byeuk'." },
      { pattern: '-ing endings',   guide: "Drop the 'g' — 'running' is 'runnin'', 'going' is 'gannin''." },
      { pattern: 'wh-',            guide: "Breathe the 'h' — 'where' sounds like 'hwor'." },
    ],
  },
  'Catalan': {
    overview: "Stress usually falls on the last or second-to-last syllable. Unstressed vowels reduce heavily — this is the biggest challenge for learners.",
    sounds: [
      { pattern: 'l·l',          guide: "Geminate — hold the 'l' a full beat longer than a single 'l'." },
      { pattern: 'ny',           guide: "Like Spanish 'ñ' or French 'gn' — 'Catalunya' contains this sound." },
      { pattern: 'ig (word end)', guide: "'tch' sound — 'mig' (middle) sounds like 'mitch'." },
      { pattern: 'unstressed a/e', guide: "Both become a schwa 'uh' — very reduced, almost swallowed." },
      { pattern: 'v',            guide: "Pronounced 'b' in most dialects — 'vi' (wine) sounds like 'bi'." },
      { pattern: 'x',            guide: "'sh' sound — 'caixa' (box) sounds like 'KAY-sha'." },
    ],
  },
  'Scottish Gaelic': {
    overview: "Stress falls on the first syllable. Gaelic has many sounds absent from English — listen for the breathy quality on aspirated consonants.",
    sounds: [
      { pattern: 'bh / mh', guide: "'v' sound at start of words, 'w' in the middle." },
      { pattern: 'ch',       guide: "Velar fricative — like 'loch'. Two types: back (broad) and front (slender, like 'hue')." },
      { pattern: 'dh / gh',  guide: "Broad: back-throat 'g' with no full stop. Slender: like 'y' in 'yes'." },
      { pattern: 'ao',       guide: "Long vowel with no English equivalent — round your lips and say 'ee'." },
      { pattern: 'final -adh', guide: "Sounds like 'ugh' — the 'd' is not heard." },
    ],
  },
  'Welsh English': {
    overview: "Welsh English carries the melody of Welsh — sentences often rise and fall in a sing-song pattern. Vowels are longer and purer than standard English.",
    sounds: [
      { pattern: 'sing-song intonation', guide: "Sentences end on a higher pitch — let the melody lift at the end." },
      { pattern: 'r',                    guide: "Always pronounced (rhotic) — never dropped as in standard British English." },
      { pattern: 'pure vowels',          guide: "No diphthong glide — 'say' is a steady 'seh', not 'seh-ee'." },
    ],
  },
  'Irish English': {
    overview: "Irish English has a clear, musical rhythm. Vowels differ markedly from British English and the 'th' sounds are often replaced.",
    sounds: [
      { pattern: 'th → t / d', guide: "'Three' sounds like 'tree', 'the' sounds like 'de' in many speakers." },
      { pattern: 'i (bit, sit)', guide: "Often raised — sounds closer to 'beet' than standard 'bit'." },
      { pattern: 'past tense', guide: "Often uses 'after' construction — 'I'm after eating' = 'I just ate'." },
      { pattern: 'final -ing', guide: "Pronounced fully — no 'runnin'' dropping; 'running' keeps its 'g'." },
    ],
  },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
  @keyframes echoIn   { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes recRing  { 0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,0.5); } 60% { box-shadow:0 0 0 10px rgba(239,68,68,0); } }
  @keyframes countPop { from { transform:scale(1.5); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes scorePop { from { transform:scale(0.7); opacity:0; } to { transform:scale(1); opacity:1; } }
  .echo-card    { animation: echoIn 0.32s cubic-bezier(0.22,1,0.36,1); }
  .echo-rec     { animation: recRing 1.1s ease-out infinite; }
  .echo-count   { animation: countPop 0.28s cubic-bezier(0.22,1,0.36,1); }
  .echo-score   { animation: scorePop 0.4s cubic-bezier(0.22,1,0.36,1); }
  .echo-btn { font-family:'Space Mono',monospace; border-radius:10px; cursor:pointer; transition:filter 0.15s, transform 0.15s; }
  .echo-btn:hover { filter:brightness(1.18); transform:translateY(-1px); }
`;

export default function EchoChamber({ language, location, audioSrc, text, onClose }) {
  const [phase, setPhase]         = useState('idle'); // idle|playing|countdown|recording|done
  const [countdown, setCountdown] = useState(3);
  const [score, setScore]         = useState(null);
  const [attempts, setAttempts]   = useState(0);
  const [guideOpen, setGuideOpen] = useState(true);

  const nativeRef    = useRef(null);
  const userRef      = useRef(null);
  const audioCtxRef  = useRef(null);
  const nativeEnvRef = useRef(null);
  const mrRef        = useRef(null);
  const chunksRef    = useRef([]);
  const ivRef        = useRef(null);
  const playbackRef  = useRef(null);

  // Decode native audio and draw waveform
  useEffect(() => {
    let ctx;
    fetch(audioSrc, { mode: 'cors' })
      .then(r => r.arrayBuffer())
      .then(buf => {
        ctx = new AudioContext();
        audioCtxRef.current = ctx;
        return ctx.decodeAudioData(buf);
      })
      .then(decoded => {
        const env = computeEnvelope(decoded);
        nativeEnvRef.current = env;
        drawWave(nativeRef.current, env, '#a78bfa');
      })
      .catch(() => {}); // proceed even if waveform fails
    return () => {
      clearInterval(ivRef.current);
      ctx?.close().catch(() => {});
    };
  }, [audioSrc]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const handleClose = () => {
    if (playbackRef.current) {
      playbackRef.current.pause();
      playbackRef.current.currentTime = 0;
      playbackRef.current = null;
    }
    clearInterval(ivRef.current);
    onClose();
  };

  const play = () => {
    if (phase !== 'idle' && phase !== 'done') return;
    setPhase('playing');
    const audio = new Audio(audioSrc);
    playbackRef.current = audio;
    audio.play().catch(() => setPhase('idle'));
    audio.onended = () => {
      let c = 3;
      setCountdown(c);
      setPhase('countdown');
      ivRef.current = setInterval(() => {
        c--;
        if (c === 0) {
          clearInterval(ivRef.current);
          startRecording();
        } else {
          setCountdown(c);
        }
      }, 1000);
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const mr   = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mrRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        try {
          const blob    = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
          const buf     = await blob.arrayBuffer();
          const decoded = await getAudioCtx().decodeAudioData(buf);
          const env     = computeEnvelope(decoded);
          drawWave(userRef.current, env, '#34d399');
          if (nativeEnvRef.current) {
            setScore(Math.round(Math.max(0, pearson(nativeEnvRef.current, env)) * 100));
          }
          setAttempts(a => a + 1);
        } catch (_) {}
        setPhase('done');
      };
      mr.start();
      setPhase('recording');
      setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, 6000);
    } catch (_) {
      setPhase('idle');
    }
  };

  const stopNow = () => {
    if (mrRef.current?.state === 'recording') mrRef.current.stop();
  };

  const tryAgain = () => {
    setScore(null);
    setPhase('idle');
    const ctx = userRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, userRef.current.width, userRef.current.height);
    // re-draw native wave in case it dimmed
    if (nativeEnvRef.current) drawWave(nativeRef.current, nativeEnvRef.current, '#a78bfa');
  };

  const scoreColor = score === null ? '#a78bfa'
    : score >= 70 ? '#34d399'
    : score >= 40 ? '#fbbf24'
    : '#f87171';

  const scoreLabel = score === null ? ''
    : score >= 70 ? 'Excellent — your ear is tuning in'
    : score >= 40 ? 'Good start — match the rhythm'
    : 'Keep going — every attempt trains the ear';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(5,3,12,0.88)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{CSS}</style>
      <div className="echo-card" style={{
        background: 'rgba(12,8,24,0.98)', border: '1px solid rgba(124,58,237,0.38)',
        borderRadius: 20, padding: '30px 32px', width: 520, maxWidth: '95vw',
        fontFamily: "'Space Mono',monospace", color: '#f0eee8', position: 'relative',
      }}>
        {/* Close */}
        <button onClick={handleClose} style={{
          position: 'absolute', top: 14, right: 16, background: 'none',
          border: 'none', color: '#4a4a5a', fontSize: 22, cursor: 'pointer', lineHeight: 1,
        }}>×</button>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, color: '#c4b5fd' }}>
              {language}
            </div>
            <div style={{ fontSize: 9, color: '#5a5a70' }}>Echo Chamber</div>
          </div>
          <div style={{ fontSize: 10, color: '#6b6b80', marginTop: 3 }}>📍 {location}</div>
          {text && (
            <div style={{
              marginTop: 11, padding: '9px 13px', borderRadius: 9,
              background: 'rgba(124,58,237,0.09)', border: '1px solid rgba(124,58,237,0.18)',
              fontSize: 11.5, color: '#9090a8', fontStyle: 'italic', lineHeight: 1.65,
            }}>"{text}"</div>
          )}

          {/* Pronunciation guide */}
          {PRONUNCIATION_GUIDES[language] && (
            <div style={{ marginTop: 13 }}>
              <button
                onClick={() => setGuideOpen(o => !o)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 11px', borderRadius: 8,
                  background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.18)',
                }}
              >
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: '#a78bfa', letterSpacing: '1.2px' }}>
                  ◈ PRONUNCIATION GUIDE
                </span>
                <span style={{ fontSize: 11, color: '#5a5a70' }}>{guideOpen ? '▲' : '▼'}</span>
              </button>

              {guideOpen && (
                <div style={{
                  marginTop: 6, padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(10,6,20,0.6)', border: '1px solid rgba(124,58,237,0.15)',
                  maxHeight: 210, overflowY: 'auto',
                }}>
                  <p style={{ margin: '0 0 10px', fontSize: 10, color: '#7a7a8c', lineHeight: 1.65 }}>
                    {PRONUNCIATION_GUIDES[language].overview}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PRONUNCIATION_GUIDES[language].sounds.map(({ pattern, guide }) => (
                      <div key={pattern} style={{
                        display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10,
                        padding: '6px 8px', borderRadius: 6,
                        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)',
                      }}>
                        <span style={{
                          fontFamily: "'Space Mono',monospace", fontSize: 10,
                          color: '#c4b5fd', fontWeight: 700, alignSelf: 'center',
                        }}>{pattern}</span>
                        <span style={{ fontSize: 10, color: '#9090a8', lineHeight: 1.55 }}>{guide}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Waveforms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 8.5, color: '#6b6b80', letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 7 }}>
              Native speaker
            </div>
            <canvas ref={nativeRef} width={220} height={72}
              style={{ width: '100%', height: 72, borderRadius: 9, display: 'block',
                background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.14)' }} />
          </div>
          <div>
            <div style={{ fontSize: 8.5, color: '#6b6b80', letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 7 }}>
              Your attempt{attempts > 0 ? ` · #${attempts}` : ''}
            </div>
            <canvas ref={userRef} width={220} height={72}
              style={{ width: '100%', height: 72, borderRadius: 9, display: 'block',
                background: 'rgba(52,211,153,0.04)',
                border: phase === 'recording'
                  ? '1px solid rgba(239,68,68,0.55)'
                  : '1px solid rgba(52,211,153,0.12)' }} />
          </div>
        </div>

        {/* Score */}
        {score !== null && (
          <div className="echo-score" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 8.5, color: '#5a5a70', letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 4 }}>
              Similarity
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 54, color: scoreColor, lineHeight: 1 }}>
              {score}%
            </div>
            <div style={{ fontSize: 10, color: '#5a5a70', marginTop: 6 }}>{scoreLabel}</div>
          </div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <div key={countdown} className="echo-count" style={{
            textAlign: 'center', fontSize: 46, fontFamily: "'Syne',sans-serif",
            fontWeight: 800, color: '#c4b5fd', marginBottom: 18, lineHeight: 1,
          }}>
            {countdown}
          </div>
        )}

        {/* Status line */}
        {phase === 'playing' && (
          <div style={{ textAlign: 'center', fontSize: 10, color: '#6b6b80', marginBottom: 18, letterSpacing: '0.8px' }}>
            listening…
          </div>
        )}
        {phase === 'countdown' && (
          <div style={{ textAlign: 'center', fontSize: 10, color: '#a78bfa', marginBottom: 18, letterSpacing: '0.8px' }}>
            get ready to speak…
          </div>
        )}
        {phase === 'recording' && (
          <div style={{ textAlign: 'center', fontSize: 10, color: '#fca5a5', marginBottom: 18, letterSpacing: '0.8px' }}>
            ● recording — speak now
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {(phase === 'idle' || phase === 'done') && (
            <button className="echo-btn" onClick={play} style={{
              background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.45)',
              color: '#c4b5fd', padding: '10px 26px', fontSize: 11,
            }}>
              ▶  Play &amp; Echo
            </button>
          )}
          {phase === 'recording' && (
            <button className="echo-btn echo-rec" onClick={stopNow} style={{
              background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.45)',
              color: '#fca5a5', padding: '10px 26px', fontSize: 11,
            }}>
              ⏹  Done
            </button>
          )}
          {phase === 'done' && (
            <button className="echo-btn" onClick={tryAgain} style={{
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.28)',
              color: '#6ee7b7', padding: '10px 26px', fontSize: 11,
            }}>
              ↺  Try Again
            </button>
          )}
        </div>

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 8.5, color: '#2e2e3e' }}>
          🤗 real community recording · CC BY-SA 4.0
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react'
import { supabase } from './supabaseClient'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;800&display=swap');`

const AGE_RANGES = ['Under 18', '18–25', '26–35', '36–50', '51–65', '65+']
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso',
  'Burundi','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile',
  'China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
  'Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador','Eritrea',
  'Estonia','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany',
  'Ghana','Greece','Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon',
  'Liberia','Libya','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Mali',
  'Malta','Mauritania','Mexico','Moldova','Mongolia','Morocco','Mozambique','Myanmar',
  'Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea',
  'North Macedonia','Norway','Oman','Pakistan','Panama','Papua New Guinea','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia',
  'Senegal','Serbia','Sierra Leone','Singapore','Slovakia','Slovenia','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Trinidad and Tobago',
  'Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam',
  'Yemen','Zambia','Zimbabwe','Other',
]

const AUDIO_ACCEPT = 'audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/mp4,audio/aac,.mp3,.wav,.ogg,.webm,.m4a,.aac'

async function geocodeTown(town, country) {
  if (!town && !country) return { lat: null, lng: null }
  try {
    const q = [town, country].filter(Boolean).join(', ')
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { Accept: 'application/json' } }
    )
    const data = await res.json()
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch (_) {}
  return { lat: null, lng: null }
}

const s = {
  page: {
    minHeight: '100%',
    background: 'linear-gradient(180deg,#0f0a1e 0%,#130d24 60%,#0f0a1e 100%)',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px 60px',
    fontFamily: "'Space Mono', monospace",
    color: '#f0eee8',
  },
  card: {
    width: '100%',
    maxWidth: '560px',
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: '26px',
    color: '#f0eee8',
    marginBottom: '8px',
    lineHeight: 1.2,
  },
  sub: {
    fontSize: '11.5px',
    color: '#9090a8',
    lineHeight: '1.75',
    marginBottom: '32px',
    paddingLeft: '12px',
    borderLeft: '2px solid rgba(124,58,237,0.4)',
  },
  label: {
    fontSize: '9.5px',
    color: '#7a7a8c',
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '7px',
  },
  field: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    background: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.28)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f0eee8',
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    background: '#130d24',
    border: '1px solid rgba(124,58,237,0.28)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f0eee8',
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    background: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.28)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f0eee8',
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    boxSizing: 'border-box',
    lineHeight: '1.65',
  },
  divider: {
    borderTop: '1px solid rgba(124,58,237,0.18)',
    margin: '28px 0',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  fileBox: {
    border: '2px dashed rgba(124,58,237,0.35)',
    borderRadius: '10px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    background: 'rgba(124,58,237,0.05)',
  },
  submitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg,#7c3aed 0%,#4c1d95 100%)',
    border: 'none',
    color: '#f0eee8',
    padding: '14px 0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    marginTop: '8px',
  },
  successBox: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.35)',
    borderRadius: '10px',
    padding: '16px 20px',
    color: '#86efac',
    fontSize: '12px',
    lineHeight: '1.7',
    marginBottom: '20px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: '10px',
    padding: '16px 20px',
    color: '#fca5a5',
    fontSize: '12px',
    lineHeight: '1.7',
    marginBottom: '20px',
  },
}

const COUNTRY_ALIASES = {
  'england': 'United Kingdom', 'scotland': 'United Kingdom',
  'wales': 'United Kingdom', 'northern ireland': 'United Kingdom',
  'great britain': 'United Kingdom', 'britain': 'United Kingdom',
  'united states of america': 'United States', 'usa': 'United States',
  'republic of ireland': 'Ireland', 'eire': 'Ireland',
  'czechia': 'Czech Republic', 'holland': 'Netherlands',
  'burma': 'Myanmar', 'persia': 'Iran',
};

function matchCountry(name) {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (COUNTRY_ALIASES[lower]) return COUNTRY_ALIASES[lower];
  const exact = COUNTRIES.find(c => c.toLowerCase() === lower);
  if (exact) return exact;
  const contains = COUNTRIES.find(c => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower));
  return contains ?? '';
}

function UploadTab({ initialLocation }) {
  const [form, setForm] = useState({
    language_name: '',
    country:  matchCountry(initialLocation?.country) ?? '',
    region:   initialLocation?.region  ?? '',
    town:     initialLocation?.town    ?? '',
    speaker_age_range: '',
    speaker_gender: '',
    description: '',
    consent_given: false,
  })
  const [audioFile, setAudioFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Sync if geocoding finishes after this tab was already open
  React.useEffect(() => {
    if (!initialLocation) return
    setForm(prev => ({
      ...prev,
      country: prev.country || matchCountry(initialLocation.country),
      region:  prev.region  || initialLocation.region  || '',
      town:    prev.town    || initialLocation.town     || '',
    }))
  }, [initialLocation])

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i)) {
      setErrorMsg('Please upload an audio file (MP3, WAV, OGG, WebM, M4A, AAC).')
      setStatus('error')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File must be under 50 MB.')
      setStatus('error')
      return
    }
    setAudioFile(file)
    setStatus(null)
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!form.language_name.trim()) { setErrorMsg('Language / dialect name is required.'); setStatus('error'); return }
    if (!form.country) { setErrorMsg('Please select a country.'); setStatus('error'); return }
    if (!audioFile) { setErrorMsg('Please attach an audio recording.'); setStatus('error'); return }
    if (!form.consent_given) { setErrorMsg('Please confirm you have consent to share this recording.'); setStatus('error'); return }

    if (!supabase) {
      setErrorMsg('Database not configured yet. Add your Supabase credentials to dialect/.env and restart the dev server.')
      setStatus('error')
      return
    }

    setStatus('uploading')

    try {
      const ext = audioFile.name.split('.').pop().toLowerCase()
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: storageErr } = await supabase.storage
        .from('recordings')
        .upload(filename, audioFile, { contentType: audioFile.type, upsert: false })
      if (storageErr) throw storageErr

      const { data: { publicUrl } } = supabase.storage.from('recordings').getPublicUrl(filename)

      const { lat, lng } = await geocodeTown(form.town, form.country)

      const { error: dbErr } = await supabase.from('community_uploads').insert({
        language_name: form.language_name.trim(),
        country: form.country,
        region: form.region.trim() || null,
        town: form.town.trim() || null,
        latitude: lat,
        longitude: lng,
        speaker_age_range: form.speaker_age_range || null,
        speaker_gender: form.speaker_gender || null,
        description: form.description.trim() || null,
        audio_url: publicUrl,
        consent_given: true,
      })
      if (dbErr) throw dbErr

      setStatus('success')
      setForm({ language_name: '', country: '', region: '', town: '', speaker_age_range: '', speaker_gender: '', description: '', consent_given: false })
      setAudioFile(null)
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div style={s.page}>
      <style>{FONTS}</style>
      <div style={s.card}>

        {/* Header */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '9.5px', color: '#7a7a8c', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Community Archive
          </div>
          <div style={s.heading}>Upload a Recording</div>
          <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg,#7c3aed,transparent)', margin: '10px 0 16px' }} />
        </div>
        <p style={s.sub}>
          Help preserve languages and accents that have never been recorded. Every upload — from a rural dialect
          to a vanishing creole — gets pinned on the globe for others to discover. You keep ownership;
          we keep the archive.
        </p>

        {status === 'success' && (
          <div style={s.successBox}>
            Recording uploaded successfully. It will appear as a pin on the globe within moments.
            Thank you for contributing to the archive.
          </div>
        )}
        {status === 'error' && errorMsg && (
          <div style={s.errorBox}>{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Language */}
          <div style={s.field}>
            <label style={s.label}>Language / Dialect Name *</label>
            <input
              style={s.input}
              type="text"
              placeholder="e.g. Zarma, Tok Pisin, Jamaican Patois..."
              value={form.language_name}
              onChange={e => set('language_name', e.target.value)}
            />
          </div>

          {/* Country */}
          <div style={s.field}>
            <label style={s.label}>
              Country *
              {initialLocation?.country && (
                <span style={{ marginLeft: 8, fontSize: 9, color: '#a78bfa', letterSpacing: '0.5px', textTransform: 'none', fontWeight: 400 }}>
                  📍 pre-filled from globe
                </span>
              )}
            </label>
            <select style={s.select} value={form.country} onChange={e => set('country', e.target.value)}>
              <option value="">Select a country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Region + Town */}
          <div style={s.row2}>
            <div style={s.field}>
              <label style={s.label}>Region / Province</label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Oaxaca, Brittany..."
                value={form.region}
                onChange={e => set('region', e.target.value)}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Town / Village</label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Tlaxiaco, Pont-Aven..."
                value={form.town}
                onChange={e => set('town', e.target.value)}
              />
            </div>
          </div>

          <div style={s.divider} />

          {/* Speaker info */}
          <div style={{ ...s.label, marginBottom: '14px' }}>Speaker Info (optional)</div>
          <div style={s.row2}>
            <div style={s.field}>
              <label style={s.label}>Age Range</label>
              <select style={s.select} value={form.speaker_age_range} onChange={e => set('speaker_age_range', e.target.value)}>
                <option value="">Select...</option>
                {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Gender</label>
              <select style={s.select} value={form.speaker_gender} onChange={e => set('speaker_gender', e.target.value)}>
                <option value="">Select...</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={s.field}>
            <label style={s.label}>What are they saying? (context / translation)</label>
            <textarea
              style={s.textarea}
              placeholder="Briefly describe the recording — what language, what's being said, any context about the dialect..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div style={s.divider} />

          {/* Audio upload */}
          <div style={s.field}>
            <label style={s.label}>Audio Recording *</label>
            <div
              style={{ ...s.fileBox, borderColor: dragOver ? 'rgba(167,139,250,0.7)' : (audioFile ? 'rgba(34,197,94,0.5)' : 'rgba(124,58,237,0.35)'), background: dragOver ? 'rgba(124,58,237,0.12)' : (audioFile ? 'rgba(34,197,94,0.06)' : 'rgba(124,58,237,0.05)') }}
              onClick={() => document.getElementById('audio-input').click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            >
              <input
                id="audio-input"
                type="file"
                accept={AUDIO_ACCEPT}
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
              {audioFile ? (
                <>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>✓</div>
                  <div style={{ fontSize: '11.5px', color: '#86efac', marginBottom: '4px' }}>{audioFile.name}</div>
                  <div style={{ fontSize: '10px', color: '#7a7a8c' }}>{(audioFile.size / 1024 / 1024).toFixed(2)} MB · Click to replace</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎙</div>
                  <div style={{ fontSize: '12px', color: '#c4b5fd', marginBottom: '4px' }}>Drop audio here or click to browse</div>
                  <div style={{ fontSize: '10px', color: '#7a7a8c' }}>MP3, WAV, OGG, WebM, M4A · Max 50 MB</div>
                </>
              )}
            </div>
          </div>

          {/* Consent */}
          <div style={{ ...s.field, display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '28px' }}>
            <input
              type="checkbox"
              id="consent"
              checked={form.consent_given}
              onChange={e => set('consent_given', e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#7c3aed', width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer' }}
            />
            <label htmlFor="consent" style={{ fontSize: '11px', color: '#9090a8', lineHeight: '1.7', cursor: 'pointer' }}>
              I confirm the speaker has consented to this recording being shared publicly for language preservation
              purposes, and that I have the right to upload it under an open access license.
            </label>
          </div>

          <button
            type="submit"
            style={s.submitBtn}
            disabled={status === 'uploading'}
            onMouseEnter={e => { if (status !== 'uploading') e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(124,58,237,0.4)' }}
            onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '' }}
          >
            {status === 'uploading' ? '⏳  Uploading…' : '⬆  Submit to the Archive'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default UploadTab

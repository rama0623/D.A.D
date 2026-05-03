import { useState } from 'react'
import './App.css'
import DialectMap from './DialectMap'
import UploadTab from './UploadTab'
import LastWordsProtocol from './LastWordsProtocol'
import EchoChamber from './EchoChamber'

const NAV_FONT = `@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@800&display=swap');`

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(124,58,237,0.25)' : 'transparent',
        border: active ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
        color: active ? '#c4b5fd' : '#5a5a70',
        padding: '5px 16px',
        borderRadius: '7px',
        cursor: 'pointer',
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.4px',
        transition: 'all 0.18s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#9090a8' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#5a5a70' }}
    >
      {label}
    </button>
  )
}

function App() {
  const [tab, setTab] = useState('globe')
  const [protocolLang, setProtocolLang] = useState('')
  const [echoData, setEchoData] = useState(null)
  const [pickedLocation, setPickedLocation] = useState(null)

  const handleStartProtocol = (lang) => {
    setProtocolLang(lang)
    setTab('protocol')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0812', display: 'flex', flexDirection: 'column' }}>
      <style>{NAV_FONT}</style>

      {/* ── Nav bar ── */}
      <div style={{
        height: '48px',
        background: 'rgba(10,8,18,0.97)',
        borderBottom: '1px solid rgba(124,58,237,0.22)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        gap: '6px',
        zIndex: 2000,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: '14px',
          color: '#a78bfa',
          letterSpacing: '0.5px',
          marginRight: '14px',
          userSelect: 'none',
        }}>
          dialect decoder
        </div>
        <TabBtn label="🌐  Globe" active={tab === 'globe'} onClick={() => setTab('globe')} />
        <TabBtn label="⬆  Upload" active={tab === 'upload'} onClick={() => setTab('upload')} />
        <TabBtn label="◉  Protocol" active={tab === 'protocol'} onClick={() => setTab('protocol')} />
      </div>

      {/* ── Content area ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Globe — always mounted so the map doesn't re-initialise on tab switch */}
        <div style={{
          position: 'absolute', inset: 0,
          visibility: tab === 'globe' ? 'visible' : 'hidden',
          pointerEvents: tab === 'globe' ? 'auto' : 'none',
        }}>
          <DialectMap
            onStartProtocol={handleStartProtocol}
            onGoUpload={() => setTab('upload')}
            onOpenEcho={setEchoData}
            onLocationPick={setPickedLocation}
          />
        </div>

        {/* Upload — mounted only when active, scrollable overlay */}
        {tab === 'upload' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', zIndex: 100 }}>
            <UploadTab initialLocation={pickedLocation} />
          </div>
        )}

        {/* Protocol — mounted only when active, scrollable overlay */}
        {tab === 'protocol' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', zIndex: 100 }}>
            <LastWordsProtocol initialLanguage={protocolLang} />
          </div>
        )}
      </div>

      {/* Echo Chamber — rendered as a global overlay above everything */}
      {echoData && (
        <EchoChamber
          language={echoData.language}
          location={echoData.location}
          audioSrc={echoData.audioSrc}
          text={echoData.text}
          onClose={() => setEchoData(null)}
        />
      )}
    </div>
  )
}

export default App

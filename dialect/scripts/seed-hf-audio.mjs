#!/usr/bin/env node
/**
 * seed-hf-audio.mjs
 *
 * Seeds dialect_recordings with real audio from two sources:
 *   1. Wikimedia Commons – Spoken Wikipedia (global languages, ~30 langs)
 *   2. HuggingFace ylacombe/english_dialects (British Isles regional accents)
 *
 * Run:  npm run seed   (from dialect/ folder)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY     = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, ANON_KEY)

const WIKI_API = 'https://commons.wikimedia.org/w/api.php'
const HF_API   = 'https://datasets-server.huggingface.co'

// ── Wikimedia Commons sources ─────────────────────────────────────────────────
// Category pattern: "Spoken [Language] Wikipedia"
const WIKI_SOURCES = [
  // Europe
  { category: 'Spoken_German_Wikipedia',              accent: 'Standard German',       country: 'Germany',       region: 'Europe',         iso: 'de-DE', lang_family: 'Indo-European', samples: 4 },
  { category: 'Spoken_French_Wikipedia',              accent: 'Standard French',       country: 'France',        region: 'Europe',         iso: 'fr-FR', lang_family: 'Indo-European', samples: 4 },
  { category: 'Spoken_Spanish_Wikipedia',             accent: 'Castilian Spanish',     country: 'Spain',         region: 'Europe',         iso: 'es-ES', lang_family: 'Indo-European', samples: 4 },
  { category: 'Spoken_Italian_Wikipedia',             accent: 'Standard Italian',      country: 'Italy',         region: 'Europe',         iso: 'it-IT', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Dutch_Wikipedia',               accent: 'Dutch',                 country: 'Netherlands',   region: 'Europe',         iso: 'nl-NL', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Portuguese_Wikipedia',          accent: 'Portuguese',            country: 'Portugal',      region: 'Europe',         iso: 'pt-PT', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Russian_Wikipedia',             accent: 'Russian',               country: 'Russia',        region: 'Eastern Europe', iso: 'ru-RU', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Polish_Wikipedia',              accent: 'Polish',                country: 'Poland',        region: 'Europe',         iso: 'pl-PL', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Norwegian_(Bokmål)_Wikipedia',  accent: 'Norwegian (Bokmål)',    country: 'Norway',        region: 'Europe',         iso: 'nb-NO', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Romanian_Wikipedia',            accent: 'Romanian',              country: 'Romania',       region: 'Europe',         iso: 'ro-RO', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Hungarian_Wikipedia',           accent: 'Hungarian',             country: 'Hungary',       region: 'Europe',         iso: 'hu-HU', lang_family: 'Uralic',        samples: 3 },
  { category: 'Spoken_Greek_Wikipedia',               accent: 'Greek',                 country: 'Greece',        region: 'Europe',         iso: 'el-GR', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Bulgarian_Wikipedia',           accent: 'Bulgarian',             country: 'Bulgaria',      region: 'Europe',         iso: 'bg-BG', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Czech_Wikipedia',               accent: 'Czech',                 country: 'Czech Republic',region: 'Europe',         iso: 'cs-CZ', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Finnish_Wikipedia',             accent: 'Finnish',               country: 'Finland',       region: 'Europe',         iso: 'fi-FI', lang_family: 'Uralic',        samples: 3 },
  { category: 'Spoken_Catalan_Wikipedia',             accent: 'Catalan',               country: 'Spain',         region: 'Europe',         iso: 'ca-ES', lang_family: 'Indo-European', samples: 3 },
  // Middle East / Central Asia
  { category: 'Spoken_Arabic_Wikipedia',              accent: 'Modern Standard Arabic',country: 'Egypt',         region: 'Middle East',    iso: 'ar-EG', lang_family: 'Afro-Asiatic',  samples: 3 },
  { category: 'Spoken_Persian_Wikipedia',             accent: 'Persian (Farsi)',        country: 'Iran',          region: 'Middle East',    iso: 'fa-IR', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Azerbaijani_Wikipedia',         accent: 'Azerbaijani',           country: 'Azerbaijan',    region: 'Caucasus',       iso: 'az-AZ', lang_family: 'Turkic',        samples: 3 },
  // South Asia
  { category: 'Spoken_Hindi_Wikipedia',               accent: 'Hindi',                 country: 'India',         region: 'South Asia',     iso: 'hi-IN', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Bengali_Wikipedia',             accent: 'Bengali',               country: 'Bangladesh',    region: 'South Asia',     iso: 'bn-BD', lang_family: 'Indo-European', samples: 3 },
  { category: 'Spoken_Malayalam_Wikipedia',           accent: 'Malayalam',             country: 'India',         region: 'South Asia',     iso: 'ml-IN', lang_family: 'Dravidian',     samples: 3 },
  { category: 'Spoken_Odia_Wikipedia',                accent: 'Odia',                  country: 'India',         region: 'South Asia',     iso: 'or-IN', lang_family: 'Indo-European', samples: 3 },
  // East / Southeast Asia
  { category: 'Spoken_Japanese_Wikipedia',            accent: 'Japanese',              country: 'Japan',         region: 'East Asia',      iso: 'ja-JP', lang_family: 'Japonic',       samples: 3 },
  { category: 'Spoken_Chinese_Wikipedia',             accent: 'Mandarin Chinese',      country: 'China',         region: 'East Asia',      iso: 'zh-CN', lang_family: 'Sino-Tibetan',  samples: 3 },
  { category: 'Spoken_Indonesian_Wikipedia',          accent: 'Indonesian',            country: 'Indonesia',     region: 'Southeast Asia', iso: 'id-ID', lang_family: 'Austronesian',  samples: 3 },
  { category: 'Spoken_Malay_Wikipedia',               accent: 'Malay',                 country: 'Malaysia',      region: 'Southeast Asia', iso: 'ms-MY', lang_family: 'Austronesian',  samples: 3 },
  { category: 'Spoken_Javanese_Wikipedia',            accent: 'Javanese',              country: 'Indonesia',     region: 'Southeast Asia', iso: 'jv-ID', lang_family: 'Austronesian',  samples: 3 },
  // Africa
  { category: 'Spoken_Hausa_Wikipedia',               accent: 'Hausa',                 country: 'Nigeria',       region: 'West Africa',    iso: 'ha-NG', lang_family: 'Afro-Asiatic',  samples: 3 },
  { category: 'Spoken_Ewe_Wikipedia',                 accent: 'Ewe',                   country: 'Ghana',         region: 'West Africa',    iso: 'ee-GH', lang_family: 'Niger-Congo',   samples: 3 },
  // Americas / conlang
  { category: 'Spoken_Esperanto_Wikipedia',           accent: 'Esperanto',             country: 'International', region: 'World',          iso: 'eo',    lang_family: 'Constructed',   samples: 3 },
]

// ── HuggingFace sources (British Isles accents) ───────────────────────────────
const HF_SOURCES = [
  { dataset: 'ylacombe/english_dialects', config: 'irish_male',    split: 'train', samples: 3,
    country: 'Ireland',        region: 'British Isles', accent: 'Irish English',         iso: 'en-IE', lang_family: 'Indo-European', license: 'CC BY-SA 4.0' },
  { dataset: 'ylacombe/english_dialects', config: 'welsh_male',    split: 'train', samples: 3,
    country: 'United Kingdom', region: 'British Isles', accent: 'Welsh English',         iso: 'en-GB', lang_family: 'Indo-European', license: 'CC BY-SA 4.0' },
  { dataset: 'ylacombe/english_dialects', config: 'scottish_male', split: 'train', samples: 3,
    country: 'United Kingdom', region: 'British Isles', accent: 'Scottish English',      iso: 'en-GB', lang_family: 'Indo-European', license: 'CC BY-SA 4.0' },
  { dataset: 'ylacombe/english_dialects', config: 'northern_male', split: 'train', samples: 3,
    country: 'United Kingdom', region: 'British Isles', accent: 'Northern English',      iso: 'en-GB', lang_family: 'Indo-European', license: 'CC BY-SA 4.0' },
  { dataset: 'ylacombe/english_dialects', config: 'southern_male', split: 'train', samples: 3,
    country: 'United Kingdom', region: 'British Isles', accent: 'Southern English (RP)', iso: 'en-GB', lang_family: 'Indo-European', license: 'CC BY-SA 4.0' },
  { dataset: 'ylacombe/english_dialects', config: 'midlands_male', split: 'train', samples: 3,
    country: 'United Kingdom', region: 'British Isles', accent: 'Midlands English',      iso: 'en-GB', lang_family: 'Indo-European', license: 'CC BY-SA 4.0' },
]

// ── Wikimedia helpers ─────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchWikiFiles(category, count) {
  const catParams = new URLSearchParams({
    action: 'query', list: 'categorymembers',
    cmtitle: `Category:${category}`, cmtype: 'file',
    cmlimit: String(count + 5), format: 'json', origin: '*',
  })
  const catRes = await fetch(`${WIKI_API}?${catParams}`)
  if (!catRes.ok) throw new Error(`HTTP ${catRes.status}`)
  const catJson = await catRes.json()
  const files = (catJson.query?.categorymembers ?? []).slice(0, count)
  if (!files.length) throw new Error('empty category')

  const titles = files.map(f => f.title).join('|')
  const infoParams = new URLSearchParams({
    action: 'query', titles, prop: 'imageinfo',
    iiprop: 'url', format: 'json', origin: '*',
  })
  const infoRes = await fetch(`${WIKI_API}?${infoParams}`)
  if (!infoRes.ok) throw new Error(`HTTP ${infoRes.status}`)
  const infoJson = await infoRes.json()

  return Object.values(infoJson.query?.pages ?? {}).map(page => ({
    title: page.title?.replace(/^File:/, '').replace(/\.(ogg|mp3|wav|flac|opus)$/i, ''),
    url:   page.imageinfo?.[0]?.url?.split('?')[0] ?? null, // strip UTM params
  })).filter(r => r.url)
}

async function fetchHFRows(dataset, config, split, count) {
  const url = `${HF_API}/rows?dataset=${encodeURIComponent(dataset)}&config=${config}&split=${split}&offset=0&length=${count}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()).rows ?? []
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  let inserted = 0, skipped = 0

  // ── 1. Wikimedia Commons ──────────────────────────────────────────────────
  console.log('\n══  Wikimedia Commons – Spoken Wikipedia  ══')
  for (const src of WIKI_SOURCES) {
    console.log(`\n📥  ${src.accent.padEnd(28)} (${src.iso})`)
    await sleep(400)
    let files
    try {
      files = await fetchWikiFiles(src.category, src.samples)
    } catch (err) {
      console.warn(`   ✗ fetch failed — ${err.message}`)
      skipped += src.samples
      continue
    }

    for (let i = 0; i < files.length; i++) {
      const { title, url } = files[i]
      const id = `wiki_${src.iso.toLowerCase().replace(/-/g, '_')}_${i}`
      process.stdout.write(`   [${i + 1}/${files.length}] inserting… `)
      try {
        const { error } = await sb.from('dialect_recordings').insert({
          id,
          region:           src.region,
          country:          src.country,
          accent_name:      src.accent,
          language_family:  src.lang_family,
          iso_code:         src.iso,
          audio_source:     'Wikimedia Commons – Spoken Wikipedia',
          direct_audio_url: url,
          license:          'CC BY-SA 3.0',
          sample_text:      title,
        })
        if (error && !error.message.includes('duplicate')) throw error
        console.log(`✓  "${title?.slice(0, 55)}"`)
        inserted++
      } catch (err) {
        console.error(`✗  ${err.message}`)
        skipped++
      }
    }
  }

  // ── 2. HuggingFace – British Isles accents ────────────────────────────────
  console.log('\n══  HuggingFace – ylacombe/english_dialects  ══')
  for (const src of HF_SOURCES) {
    console.log(`\n📥  ${src.accent.padEnd(28)} (${src.config})`)
    let rows
    try {
      rows = await fetchHFRows(src.dataset, src.config, src.split, src.samples)
    } catch (err) {
      console.warn(`   ✗ fetch failed — ${err.message}`)
      skipped += src.samples
      continue
    }

    for (let i = 0; i < rows.length; i++) {
      const row      = rows[i].row
      const entry    = Array.isArray(row.audio) ? row.audio[0] : row.audio
      const audioSrc = entry?.src
      const text     = row.text ?? row.transcription ?? row.sentence ?? ''
      if (!audioSrc) { skipped++; continue }

      process.stdout.write(`   [${i + 1}/${rows.length}] inserting… `)
      try {
        const { error } = await sb.from('dialect_recordings').insert({
          id:                   `hf_${src.config}_${i}`,
          region:               src.region,
          country:              src.country,
          accent_name:          src.accent,
          language_family:      src.lang_family,
          iso_code:             src.iso,
          audio_source:         src.dataset,
          direct_audio_url:     audioSrc,
          license:              src.license,
          sample_text:          text,
          recording_duration_s: row.audio_duration ? Math.round(row.audio_duration) : null,
        })
        if (error && !error.message.includes('duplicate')) throw error
        const preview = text.length > 55 ? text.slice(0, 55) + '…' : text
        console.log(`✓  "${preview}"`)
        inserted++
      } catch (err) {
        console.error(`✗  ${err.message}`)
        skipped++
      }
    }
  }

  console.log(`\n${'─'.repeat(55)}`)
  console.log(`✅  Seeding complete — ${inserted} inserted, ${skipped} skipped`)
}

seed().catch(err => {
  console.error('\n💥 Fatal:', err.message)
  process.exit(1)
})

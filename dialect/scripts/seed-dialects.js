/**
 * Seed script — imports accent_dialect_database CSV into Supabase.
 *
 * Usage (from the dialect/ directory):
 *   node scripts/seed-dialects.js
 *
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in dialect/.env
 * (Service role key is found in Supabase → Project Settings → API → service_role)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load .env from the parent directory (dialect/.env) ──────────────────────
const envPath = join(__dirname, '..', '.env')
let envText
try {
  envText = readFileSync(envPath, 'utf8')
} catch {
  console.error('Could not read .env file at', envPath)
  process.exit(1)
}

const env = {}
envText.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const idx = trimmed.indexOf('=')
  if (idx > 0) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || supabaseUrl.startsWith('your_')) {
  console.error('VITE_SUPABASE_URL is not set in dialect/.env')
  process.exit(1)
}
if (!supabaseKey || supabaseKey.startsWith('your_')) {
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY is not set in dialect/.env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── CSV parser (handles quoted fields) ──────────────────────────────────────
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]))
  })
}

// ── Read CSV ─────────────────────────────────────────────────────────────────
const csvPath = 'C:/Users/rorya/Downloads/accent_dialect_database (1).csv'
let rawCSV
try {
  rawCSV = readFileSync(csvPath, 'utf8')
} catch {
  console.error('Could not read CSV at:', csvPath)
  console.error('Make sure the file is still at that path, or update csvPath in this script.')
  process.exit(1)
}

const rows = parseCSV(rawCSV)

const records = rows
  .filter(row => row['ID'])
  .map(row => ({
    id: row['ID'],
    region: row['Region'] || null,
    country: row['Country / Territory'] || null,
    accent_name: row['Accent / Dialect Name'] || null,
    language_family: row['Language Family'] || null,
    iso_code: row['ISO 639-3 Code'] || null,
    speaker_population: row['Speaker Population (est.)'] || null,
    speaker_age_range: row['Speaker Age Range'] || null,
    speaker_gender: row['Speaker Gender'] || null,
    urban_rural: row['Urban / Rural'] || null,
    proficiency_level: row['Proficiency Level'] || null,
    recording_duration_s: parseInt(row['Recording Duration (s)']) || null,
    sample_text: row['Sample Text / Prompt'] || null,
    audio_source: row['Audio Source'] || null,
    direct_audio_url: row['Direct Audio URL'] || null,
    license: row['License'] || null,
    additional_notes: row['Additional Notes'] || null,
  }))

console.log(`Parsed ${records.length} records from CSV. Upserting into Supabase…`)

const { error } = await supabase
  .from('dialect_recordings')
  .upsert(records, { onConflict: 'id' })

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}

console.log(`✓ Successfully seeded ${records.length} dialect recordings into Supabase.`)

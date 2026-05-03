/**
 * Seed script — populates `dialect_recordings` with 89 curated language samples
 * covering extinct, endangered, and active/rare languages from every continent.
 *
 * Usage (from the dialect/ directory):
 *   node scripts/seed-dialect-recordings.js
 *
 * Prerequisites:
 *  - Run the ALTER TABLE lines from supabase_setup.sql in your Supabase SQL editor
 *    to add the latitude, longitude, and status columns if they don't exist yet.
 *  - VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY must be set in dialect/.env
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load .env ────────────────────────────────────────────────────────────────
const envPath = join(__dirname, '..', '.env')
let envText
try { envText = readFileSync(envPath, 'utf8') } catch {
  console.error('Could not read .env at', envPath); process.exit(1)
}
const env = {}
envText.split('\n').forEach(line => {
  const t = line.trim()
  if (!t || t.startsWith('#')) return
  const idx = t.indexOf('=')
  if (idx > 0) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim()
})
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY'); process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

// ── Language records ──────────────────────────────────────────────────────────
// All entries use IDs prefixed with 'DR-' to distinguish from CSV-imported rows.
// Fields match the dialect_recordings table schema exactly.
// ─────────────────────────────────────────────────────────────────────────────

const RECORDS = [

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTINCT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-ubykh', region: 'Caucasus', country: 'Turkey',
    accent_name: 'Ubykh', language_family: 'Northwest Caucasian',
    iso_code: 'uby', speaker_population: '0',
    sample_text: 'Last spoken by Tevfik Esenç, who died in 1992. Had 84 distinct consonants — the most of any documented language.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last speaker died 1992. Language isolate with the world\'s largest consonant inventory.',
    latitude: 41.0, longitude: 39.7, status: 'extinct',
  },
  {
    id: 'DR-eyak', region: 'North America', country: 'United States',
    accent_name: 'Eyak', language_family: 'Na-Dene (Athabaskan-Eyak-Tlingit)',
    iso_code: 'eya', speaker_population: '0',
    sample_text: 'Last documented by linguist Michael Krauss. Marie Smith Jones, the last fluent speaker, died 13 January 2008.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last fluent speaker Marie Smith Jones died 2008 in Cordova, Alaska.',
    latitude: 60.5, longitude: -145.5, status: 'extinct',
  },
  {
    id: 'DR-klallam', region: 'North America', country: 'United States',
    accent_name: "Klallam (S'Klallam)", language_family: 'Salishan',
    iso_code: 'clm', speaker_population: '0',
    sample_text: 'Hazel Sampson recorded hours of Klallam stories before her death. Revitalisation programme active at Port Gamble S\'Klallam Tribe.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last fluent speaker Hazel Sampson died 2014 in Washington State.',
    latitude: 47.9, longitude: -122.8, status: 'extinct',
  },
  {
    id: 'DR-aka-bo', region: 'South Asia', country: 'India',
    accent_name: 'Aka-Bo (Bo)', language_family: 'Great Andamanese',
    iso_code: 'akm', speaker_population: '0',
    sample_text: 'Boa Sr sang the last songs in Aka-Bo before her death. One of ten original Great Andamanese languages.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last speaker Boa Sr died February 2010 in the Andaman Islands.',
    latitude: 12.5, longitude: 92.8, status: 'extinct',
  },
  {
    id: 'DR-mandan', region: 'North America', country: 'United States',
    accent_name: 'Mandan', language_family: 'Siouan',
    iso_code: 'mhq', speaker_population: '0',
    sample_text: 'Ȟánib čaȟmí — "I am eating." Edwin Benson taught classes on the Fort Berthold Reservation until his death.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last fluent speaker Edwin Benson died 2016 in North Dakota.',
    latitude: 47.0, longitude: -101.0, status: 'extinct',
  },
  {
    id: 'DR-dalmatian', region: 'Europe', country: 'Croatia',
    accent_name: 'Dalmatian', language_family: 'Romance (Indo-European)',
    iso_code: 'dlm', speaker_population: '0',
    sample_text: 'Tuot el münd ái sü raizun — "Everyone has their reason." Isolated in the Dalmatian coastal islands.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last speaker Antonio Udina (Tuone Udaina) died in an explosion in 1898.',
    latitude: 43.5, longitude: 16.4, status: 'extinct',
  },
  {
    id: 'DR-gothic', region: 'Eastern Europe', country: 'Ukraine',
    accent_name: 'Gothic', language_family: 'Germanic (Indo-European)',
    iso_code: 'got', speaker_population: '0',
    sample_text: 'Atta unsar, þu in himinam — "Our Father, who art in heaven." Preserved in Wulfila\'s 4th-century Bible translation.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last attested ca. 9th century in Crimea (Crimean Gothic). Oldest Germanic language with texts.',
    latitude: 44.5, longitude: 34.0, status: 'extinct',
  },
  {
    id: 'DR-livonian', region: 'Europe', country: 'Latvia',
    accent_name: 'Livonian (Līvõ kēļ)', language_family: 'Uralic (Finnic)',
    iso_code: 'liv', speaker_population: '0',
    sample_text: 'Mina um Līvõ — "I am Livonian." Spoken along the Livonian Coast of Latvia.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last native speaker Grizelda Kristiņa died 2013. Revitalisation efforts ongoing.',
    latitude: 57.6, longitude: 22.5, status: 'extinct',
  },
  {
    id: 'DR-manchu', region: 'East Asia', country: 'China',
    accent_name: 'Manchu (Manju gisun)', language_family: 'Tungusic (Altaic)',
    iso_code: 'mnc', speaker_population: '~10',
    sample_text: 'Sini gebu ai? — "What is your name?" Language of the Qing Dynasty emperors, now functionally extinct.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Functionally extinct — fewer than 20 elderly native speakers in Sanjiazi village, Heilongjiang.',
    latitude: 42.0, longitude: 125.5, status: 'extinct',
  },
  {
    id: 'DR-yaghan', region: 'South America', country: 'Chile',
    accent_name: 'Yaghan (Yámana)', language_family: 'Language isolate',
    iso_code: 'yag', speaker_population: '0',
    sample_text: 'Mamihlapinatapai — "a look shared between two people, each wishing the other would initiate something." The world\'s most succinct word.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last native speaker Cristina Calderón died 16 February 2022 in Ukika, Chile.',
    latitude: -55.0, longitude: -67.5, status: 'extinct',
  },
  {
    id: 'DR-coptic', region: 'North Africa', country: 'Egypt',
    accent_name: 'Coptic', language_family: 'Afro-Asiatic (Egyptian)',
    iso_code: 'cop', speaker_population: '0',
    sample_text: 'Oujai qen pJoeis — "Salvation is in the Lord." Last phase of the Ancient Egyptian language.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct as spoken language — survives as liturgical language of the Coptic Orthodox Church.',
    latitude: 30.0, longitude: 31.3, status: 'extinct',
  },
  {
    id: 'DR-kwadi', region: 'Southern Africa', country: 'Angola',
    accent_name: 'Kwadi', language_family: 'Khoisan (tentative)',
    iso_code: 'kwz', speaker_population: '0',
    sample_text: 'Related to the Khoe languages spoken by herding peoples of southern Angola. Last documented in the 1960s.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Extinct — last confirmed speakers documented in 1960s. Possible link to Khoisan family.',
    latitude: -17.0, longitude: 14.5, status: 'extinct',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENDANGERED — EUROPE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-welsh', region: 'Europe', country: 'United Kingdom',
    accent_name: 'Welsh (Cymraeg)', language_family: 'Celtic (Indo-European)',
    iso_code: 'wel', speaker_population: '538,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural/Urban', proficiency_level: 'Native',
    sample_text: 'Bore da, sut mae hi heddiw? — "Good morning, how is it today?"',
    audio_source: 'Original recording',
    direct_audio_url: '/audio/welsh.mp3',
    license: null,
    additional_notes: 'Vulnerable — active in the Welsh heartland (Y Fro Gymraeg) but declining overall.',
    latitude: 52.1, longitude: -3.8, status: 'endangered',
  },
  {
    id: 'DR-irish', region: 'Europe', country: 'Ireland',
    accent_name: 'Irish (Gaeilge)', language_family: 'Celtic (Indo-European)',
    iso_code: 'gle', speaker_population: '73,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Dia duit — "Hello" (lit. "God be with you"). Spoken in Gaeltacht regions of the west coast.',
    audio_source: 'Original recording',
    direct_audio_url: '/audio/irish.mp3',
    license: null,
    additional_notes: 'Definitely Endangered — Gaeltacht shrinking; first official language of Ireland with ~73,000 daily speakers.',
    latitude: 53.3, longitude: -9.7, status: 'endangered',
  },
  {
    id: 'DR-scots-gaelic', region: 'Europe', country: 'United Kingdom',
    accent_name: 'Scottish Gaelic (Gàidhlig)', language_family: 'Celtic (Indo-European)',
    iso_code: 'gla', speaker_population: '57,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Madainn mhath — "Good morning." Primary stronghold in the Outer Hebrides (Na h-Eileanan Siar).',
    audio_source: 'Wikipedia / Wikimedia Commons',
    direct_audio_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Gd-Scottish_Gaelic.ogg',
    license: 'CC BY-SA 3.0',
    additional_notes: 'Severely Endangered — spoken mainly in the Western Isles; strong media presence via BBC Alba.',
    latitude: 57.5, longitude: -5.0, status: 'endangered',
  },
  {
    id: 'DR-breton', region: 'Europe', country: 'France',
    accent_name: 'Breton (Brezhoneg)', language_family: 'Celtic (Indo-European)',
    iso_code: 'bre', speaker_population: '200,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Demat — "Hello." Brittany is the only Celtic-speaking region on mainland Europe.',
    audio_source: 'Wikipedia / Wikimedia Commons',
    direct_audio_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Br-Brezhoneg.ogg',
    license: 'CC BY-SA 3.0',
    additional_notes: 'Severely Endangered (UNESCO) — suppressed by French state since 1789; immersion schools (Diwan) now reviving it.',
    latitude: 48.2, longitude: -3.2, status: 'endangered',
  },
  {
    id: 'DR-cornish', region: 'Europe', country: 'United Kingdom',
    accent_name: 'Cornish (Kernewek)', language_family: 'Celtic (Indo-European)',
    iso_code: 'cor', speaker_population: '558',
    speaker_age_range: 'All ages', urban_rural: 'Rural/Urban', proficiency_level: 'L2',
    sample_text: 'Myttin da — "Good morning." Extinct by 1777; successfully revived from manuscripts in the 20th century.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered (revived) — extinct 1777; revived from written records; 558 fluent speakers in 2011 census.',
    latitude: 50.3, longitude: -5.0, status: 'endangered',
  },
  {
    id: 'DR-manx', region: 'Europe', country: 'United Kingdom',
    accent_name: 'Manx (Gaelg)', language_family: 'Celtic (Indo-European)',
    iso_code: 'glv', speaker_population: '1,800',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'L2',
    sample_text: 'Moghrey mie — "Good morning." Native speaker Ned Maddrell died 1974; language revived from recordings.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered (revived) — native speaker line died 1974; now ~1,800 speakers via immersion education.',
    latitude: 54.2, longitude: -4.5, status: 'endangered',
  },
  {
    id: 'DR-basque', region: 'Europe', country: 'Spain',
    accent_name: 'Basque (Euskara)', language_family: 'Language isolate',
    iso_code: 'eus', speaker_population: '750,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural/Urban', proficiency_level: 'Native',
    sample_text: 'Egun on — "Good day." A language isolate with no known relatives, predating Indo-European arrival in Europe.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — actively revitalised; official language in the Basque Country and Navarre.',
    latitude: 43.0, longitude: -1.8, status: 'endangered',
  },
  {
    id: 'DR-occitan', region: 'Europe', country: 'France',
    accent_name: 'Occitan', language_family: 'Romance (Indo-European)',
    iso_code: 'oci', speaker_population: '200,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Bonjorn — "Good day." Language of the troubadours; spoken from southern France to northern Italy.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Severely Endangered — suppressed since the French Revolution; spoken across Languedoc, Provence, Gascony.',
    latitude: 43.6, longitude: 3.0, status: 'endangered',
  },
  {
    id: 'DR-romani', region: 'Europe', country: 'Romania',
    accent_name: 'Romani (Romanes)', language_family: 'Indo-Aryan (Indo-European)',
    iso_code: 'rom', speaker_population: '3,500,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Lačho dives — "Good day." Romani originated in northern India; spread to Europe from the 14th century.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — many dialects severely endangered; spoken by Roma diaspora across Europe and beyond.',
    latitude: 45.0, longitude: 20.0, status: 'endangered',
  },
  {
    id: 'DR-yiddish', region: 'Europe', country: 'Israel',
    accent_name: 'Yiddish', language_family: 'Germanic (Indo-European)',
    iso_code: 'yid', speaker_population: '1,500,000',
    speaker_age_range: 'Older adults', urban_rural: 'Urban', proficiency_level: 'Native',
    sample_text: 'Sholem aleykhem — "Peace be upon you." A Jewish lingua franca of Eastern European origin with Hebrew, Slavic and Germanic elements.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — lost ~75% of speakers in the Holocaust; surviving communities in Israel, USA, and UK.',
    latitude: 51.1, longitude: 17.0, status: 'endangered',
  },
  {
    id: 'DR-northern-sami', region: 'Europe', country: 'Norway',
    accent_name: 'Northern Sámi (Davvisámegiella)', language_family: 'Uralic (Samic)',
    iso_code: 'sme', speaker_population: '20,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Buorre iđit — "Good morning." Spoken by the Sámi people across the Arctic regions of Norway, Sweden and Finland.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — official language in several Norwegian municipalities; revitalisation ongoing.',
    latitude: 69.5, longitude: 25.5, status: 'endangered',
  },
  {
    id: 'DR-inari-sami', region: 'Europe', country: 'Finland',
    accent_name: 'Inari Sámi (Anarâškielâ)', language_family: 'Uralic (Samic)',
    iso_code: 'smn', speaker_population: '350',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Pyeri iđit — "Good morning." Spoken only in the municipality of Inari, Finland.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — only ~350 speakers, all in Inari municipality. Active language nest programme.',
    latitude: 68.9, longitude: 27.7, status: 'endangered',
  },
  {
    id: 'DR-sorbian-upper', region: 'Europe', country: 'Germany',
    accent_name: 'Upper Sorbian (Hornjoserbsce)', language_family: 'Slavic (Indo-European)',
    iso_code: 'hsb', speaker_population: '13,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Dobry rano — "Good morning." A West Slavic language spoken in the Lusatia region of eastern Germany.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — official regional language in Saxony; recognised Slavic minority in Germany.',
    latitude: 51.4, longitude: 14.3, status: 'endangered',
  },
  {
    id: 'DR-sardinian', region: 'Europe', country: 'Italy',
    accent_name: 'Sardinian (Sardu)', language_family: 'Romance (Indo-European)',
    iso_code: 'srd', speaker_population: '1,000,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Bona die — "Good day." Considered the most conservative of all Romance languages, closest to Vulgar Latin.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — spoken across Sardinia; distinct from Italian; youngest speakers mainly rural elderly.',
    latitude: 40.0, longitude: 9.0, status: 'endangered',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENDANGERED — MIDDLE EAST & CAUCASUS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-assyrian', region: 'Middle East', country: 'Iraq',
    accent_name: 'Assyrian Neo-Aramaic', language_family: 'Semitic (Afro-Asiatic)',
    iso_code: 'aii', speaker_population: '570,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban', proficiency_level: 'Native',
    sample_text: 'Shlama — "Peace." A direct descendant of the Aramaic language spoken by Jesus of Nazareth.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Severely Endangered — diaspora displaced by conflict in Iraq and Syria; communities in USA, Sweden, and Australia.',
    latitude: 36.2, longitude: 43.4, status: 'endangered',
  },
  {
    id: 'DR-laz', region: 'Caucasus', country: 'Turkey',
    accent_name: 'Laz (Lazuri)', language_family: 'South Caucasian (Kartvelian)',
    iso_code: 'lzz', speaker_population: '22,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Bari moxtu — "Welcome." Spoken along the Black Sea coast of northeastern Turkey and Georgia.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Severely Endangered — rapid shift to Turkish; younger generations mostly monolingual Turkish.',
    latitude: 41.2, longitude: 41.5, status: 'endangered',
  },
  {
    id: 'DR-udi', region: 'Caucasus', country: 'Azerbaijan',
    accent_name: 'Udi', language_family: 'Northeast Caucasian (Lezgic)',
    iso_code: 'udi', speaker_population: '4,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Spoken in the village of Nij, Azerbaijan — possibly a direct descendant of Caucasian Albanian.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Severely Endangered — main community in Nij village; possibly a relic of ancient Caucasian Albanian.',
    latitude: 41.0, longitude: 47.5, status: 'endangered',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENDANGERED — SOUTH ASIA
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-sanskrit', region: 'South Asia', country: 'India',
    accent_name: 'Sanskrit (संस्कृतम्)', language_family: 'Indo-Aryan (Indo-European)',
    iso_code: 'san', speaker_population: '25,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban', proficiency_level: 'L2',
    sample_text: 'Namas te — "I bow to you." The classical liturgical language of Hinduism, Buddhism and Jainism.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'At Risk — no native community; learned as a classical/religious language; ~25,000 speakers in India.',
    latitude: 25.0, longitude: 80.0, status: 'endangered',
  },
  {
    id: 'DR-toda', region: 'South Asia', country: 'India',
    accent_name: 'Toda', language_family: 'Dravidian',
    iso_code: 'tcx', speaker_population: '1,600',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Spoken by the Toda pastoralist community in the Nilgiri Hills of Tamil Nadu. Unique system of temple dairy rites.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — ~1,600 speakers in the Nilgiris; community practices unique ritual dairying.',
    latitude: 11.4, longitude: 76.6, status: 'endangered',
  },
  {
    id: 'DR-great-andamanese', region: 'South Asia', country: 'India',
    accent_name: 'Great Andamanese', language_family: 'Great Andamanese (isolate)',
    iso_code: 'gac', speaker_population: '~50',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'One of the oldest language families on Earth, possibly descended from the first human migrations out of Africa.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — ~50 speakers on Strait Island; the original 10 languages now merged into one.',
    latitude: 12.3, longitude: 92.8, status: 'endangered',
  },
  {
    id: 'DR-burushaski', region: 'South Asia', country: 'Pakistan',
    accent_name: 'Burusho (Burushaski)', language_family: 'Language isolate',
    iso_code: 'bsk', speaker_population: '90,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Salaam — "Hello." A language isolate in the Hunza Valley of northern Pakistan with no known relatives.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — language isolate in the Karakoram mountains; spoken by the Burusho people of Hunza and Nagar.',
    latitude: 36.3, longitude: 74.6, status: 'endangered',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENDANGERED — EAST ASIA & PACIFIC
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-ainu', region: 'East Asia', country: 'Japan',
    accent_name: 'Ainu', language_family: 'Language isolate',
    iso_code: 'ain', speaker_population: '~10',
    speaker_age_range: 'Elderly', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Irankarapte — "I humbly touch your heart" (greeting). The indigenous language of Hokkaido and Sakhalin.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — fewer than 10 fluent speakers; recognised as indigenous language in Japan in 2019.',
    latitude: 43.0, longitude: 143.0, status: 'endangered',
  },
  {
    id: 'DR-evenki', region: 'Siberia', country: 'Russia',
    accent_name: 'Evenki (Ewenki)', language_family: 'Tungusic',
    iso_code: 'evn', speaker_population: '7,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Spoken by reindeer herders and hunters across the Siberian taiga from the Yenisei to the Pacific.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Severely Endangered — most of the 38,000 ethnic Evenki are now Russian-speaking.',
    latitude: 55.0, longitude: 110.0, status: 'endangered',
  },
  {
    id: 'DR-nivkh', region: 'Siberia', country: 'Russia',
    accent_name: 'Nivkh (Gilyak)', language_family: 'Language isolate',
    iso_code: 'niv', speaker_population: '200',
    speaker_age_range: 'Elderly', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Language isolate of Sakhalin Island and the Amur River delta. Unique system of noun incorporation.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — ~200 speakers on Sakhalin Island; a language isolate with no known relatives.',
    latitude: 52.5, longitude: 141.5, status: 'endangered',
  },
  {
    id: 'DR-tibetan', region: 'East Asia', country: 'China',
    accent_name: 'Tibetan (Standard/Central)', language_family: 'Sino-Tibetan',
    iso_code: 'bod', speaker_population: '1,200,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Tashi Delek — "Good luck / blessings." The cultural language of the Tibetan Buddhist world.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — under pressure from Mandarin in the Tibet Autonomous Region; ~1.2m native speakers.',
    latitude: 29.6, longitude: 91.1, status: 'endangered',
  },
  {
    id: 'DR-uyghur', region: 'Central Asia', country: 'China',
    accent_name: 'Uyghur (ئۇيغۇرچە)', language_family: 'Turkic',
    iso_code: 'uig', speaker_population: '10,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Yaxshimusiz — "How are you?" The major language of the Xinjiang Uyghur Autonomous Region.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — facing institutional suppression in Xinjiang, China; ~10m speakers worldwide.',
    latitude: 41.2, longitude: 85.2, status: 'endangered',
  },
  {
    id: 'DR-maori', region: 'Oceania', country: 'New Zealand',
    accent_name: 'Māori (Te Reo Māori)', language_family: 'Austronesian (Polynesian)',
    iso_code: 'mri', speaker_population: '50,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Kia ora — "Hello / be well." The indigenous language of Aotearoa; co-official with English since 1987.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — active revitalisation through kura kaupapa (immersion schools) and Māori TV.',
    latitude: -38.5, longitude: 175.0, status: 'endangered',
  },
  {
    id: 'DR-hawaiian', region: 'Oceania', country: 'United States',
    accent_name: "Hawaiian (ʻŌlelo Hawaiʻi)", language_family: 'Austronesian (Polynesian)',
    iso_code: 'haw', speaker_population: '24,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural/Urban', proficiency_level: 'Native',
    sample_text: 'Aloha — "Hello / love / peace." The language of the original inhabitants of the Hawaiian archipelago.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: "Critically Endangered — revitalisation through Pūnana Leo language nests; Niʻihau island still native-speaking.",
    latitude: 20.5, longitude: -157.0, status: 'endangered',
  },
  {
    id: 'DR-chamorro', region: 'Oceania', country: 'Guam',
    accent_name: "Chamorro (Fino' Chamoru)", language_family: 'Austronesian (Malayo-Polynesian)',
    iso_code: 'cha', speaker_population: '58,000',
    speaker_age_range: 'Older adults', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Håfa Adai — "Hello." The indigenous Micronesian language of Guam and the Northern Mariana Islands.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — co-official language in Guam; intergenerational transmission declining.',
    latitude: 13.4, longitude: 144.8, status: 'endangered',
  },
  {
    id: 'DR-warlpiri', region: 'Oceania', country: 'Australia',
    accent_name: 'Warlpiri', language_family: 'Pama-Nyungan (Australian)',
    iso_code: 'wbp', speaker_population: '3,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Yuwayi — "Yes." Spoken by the Warlpiri people in the Tanami Desert of the Northern Territory.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — one of the larger surviving Aboriginal languages; also giving rise to Light Warlpiri mixed language.',
    latitude: -20.6, longitude: 130.8, status: 'endangered',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENDANGERED — AFRICA
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-hadza', region: 'East Africa', country: 'Tanzania',
    accent_name: 'Hadza', language_family: 'Language isolate',
    iso_code: 'hts', speaker_population: '1,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'One of the few remaining click languages not related to Khoisan. Spoken by hunter-gatherers near Lake Eyasi.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — language isolate; spoken by the last hunter-gatherer community of East Africa.',
    latitude: -3.8, longitude: 35.0, status: 'endangered',
  },
  {
    id: 'DR-sandawe', region: 'East Africa', country: 'Tanzania',
    accent_name: 'Sandawe', language_family: 'Language isolate (possible Khoisan)',
    iso_code: 'sad', speaker_population: '60,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'A click language spoken in the Singida Region; may be distantly related to Khoekhoe of southern Africa.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — click language in central Tanzania; possibly linked to the Khoisan family.',
    latitude: -5.5, longitude: 36.0, status: 'endangered',
  },
  {
    id: 'DR-ongota', region: 'East Africa', country: 'Ethiopia',
    accent_name: 'Ongota (Birale)', language_family: 'Afro-Asiatic (uncertain)',
    iso_code: 'bxe', speaker_population: '~8',
    speaker_age_range: 'Elderly', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Spoken on the west bank of the Weito River, southwestern Ethiopia. Considered a language isolate by some linguists.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — fewer than 10 fluent speakers; possibly a language isolate of southwestern Ethiopia.',
    latitude: 5.7, longitude: 36.5, status: 'endangered',
  },
  {
    id: 'DR-ju-hoansi', region: 'Southern Africa', country: 'Namibia',
    accent_name: "Juǀ'hoansi (!Kung)", language_family: 'Khoisan (Ju)',
    iso_code: 'ktz', speaker_population: '44,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'A highly complex click language spoken by the San hunter-gatherers of the Kalahari Desert.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — San Bushmen; one of the most studied click languages with four distinct click types.',
    latitude: -19.0, longitude: 20.5, status: 'endangered',
  },
  {
    id: 'DR-laal', region: 'Central Africa', country: 'Chad',
    accent_name: 'Laal', language_family: 'Language isolate',
    iso_code: 'gdm', speaker_population: '750',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'A language isolate spoken in three villages along the Chari River in southern Chad.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — ~750 speakers in three villages; a language isolate with no known relatives.',
    latitude: 10.2, longitude: 17.5, status: 'endangered',
  },
  {
    id: 'DR-tamasheq', region: 'West Africa', country: 'Mali',
    accent_name: 'Tamasheq (Tuareg)', language_family: 'Afro-Asiatic (Berber)',
    iso_code: 'taq', speaker_population: '870,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Tanemmirt — "Thank you." The language of the Tuareg nomads of the central Sahara.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — nomadic Tuareg language of the Sahara; written in the ancient Tifinagh script.',
    latitude: 17.0, longitude: 2.0, status: 'endangered',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENDANGERED — AMERICAS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-navajo', region: 'North America', country: 'United States',
    accent_name: 'Navajo (Diné Bizaad)', language_family: 'Na-Dene (Athabaskan)',
    iso_code: 'nav', speaker_population: '170,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Yá\'át\'ééh — "Hello / it is good." Used as an unbreakable code by the Navajo Code Talkers in WWII.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — largest indigenous language in the USA; intergenerational transmission declining despite revival efforts.',
    latitude: 36.5, longitude: -108.7, status: 'endangered',
  },
  {
    id: 'DR-cherokee', region: 'North America', country: 'United States',
    accent_name: 'Cherokee (ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ)', language_family: 'Iroquoian',
    iso_code: 'chr', speaker_population: '2,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'ᎣᏏᏲ (Osiyo) — "Hello." The Cherokee syllabary was invented by Sequoyah around 1820.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Severely Endangered — fewer than 2,000 fluent speakers; has its own syllabic writing system (Sequoyan).',
    latitude: 35.5, longitude: -83.5, status: 'endangered',
  },
  {
    id: 'DR-lakota', region: 'North America', country: 'United States',
    accent_name: 'Lakota (Lak̓ȟótiyapi)', language_family: 'Siouan',
    iso_code: 'lkt', speaker_population: '2,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Háu kola — "Hello, friend" (male speaker). Language of the Great Plains Sioux nations.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Critically Endangered — ~2,000 fluent speakers on the Standing Rock and Pine Ridge reservations.',
    latitude: 44.0, longitude: -100.5, status: 'endangered',
  },
  {
    id: 'DR-ojibwe', region: 'North America', country: 'United States',
    accent_name: 'Ojibwe (Anishinaabemowin)', language_family: 'Algonquian',
    iso_code: 'oji', speaker_population: '100,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Aaniiin — "Hello." One of the larger surviving indigenous languages of North America.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — spoken across the Great Lakes region of the USA and Canada.',
    latitude: 46.5, longitude: -85.5, status: 'endangered',
  },
  {
    id: 'DR-inuktitut', region: 'North America', country: 'Canada',
    accent_name: 'Inuktitut (ᐃᓄᒃᑎᑐᑦ)', language_family: 'Eskimo-Aleut',
    iso_code: 'iku', speaker_population: '40,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Ainngai — "Hello." Written in Inuktitut syllabics; official language of Nunavut territory.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — official language of Nunavut; strongest in remote communities of the Canadian Arctic.',
    latitude: 63.0, longitude: -75.0, status: 'endangered',
  },
  {
    id: 'DR-cree', region: 'North America', country: 'Canada',
    accent_name: 'Cree (Nēhiyawēwin)', language_family: 'Algonquian',
    iso_code: 'cre', speaker_population: '117,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Tânisi — "Hello, how are you?" The most widely spoken indigenous language in Canada.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — most widely spoken indigenous language in Canada; written in Cree syllabics.',
    latitude: 54.0, longitude: -75.0, status: 'endangered',
  },
  {
    id: 'DR-tzeltal', region: 'Central America', country: 'Mexico',
    accent_name: 'Tzeltal (Batsil kop)', language_family: 'Mayan',
    iso_code: 'tzh', speaker_population: '530,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Banti la yoʼtan? — "How are you?" Tzeltal uses absolute directions (north/south/east/west) instead of relative ones (left/right).',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — spoken in the highlands of Chiapas; uses cardinal directions instead of egocentric spatial references.',
    latitude: 16.5, longitude: -92.0, status: 'endangered',
  },
  {
    id: 'DR-aymara', region: 'South America', country: 'Bolivia',
    accent_name: 'Aymara (Aymar aru)', language_family: 'Aymaran',
    iso_code: 'aym', speaker_population: '1,700,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Kamisaraki — "How are you?" Uniquely, Aymara conceptualises the past as "in front" and the future as "behind".',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Vulnerable — co-official language of Bolivia and Peru; spoken around Lake Titicaca.',
    latitude: -16.5, longitude: -68.5, status: 'endangered',
  },
  {
    id: 'DR-mapudungun', region: 'South America', country: 'Chile',
    accent_name: 'Mapudungun (Mapuche)', language_family: 'Araucanian (isolate)',
    iso_code: 'arn', speaker_population: '250,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Mari mari — "Hello." Language of the Mapuche, the largest indigenous group in Chile.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — language isolate; Mapuche people successfully resisted both Inca and Spanish conquest.',
    latitude: -38.5, longitude: -72.5, status: 'endangered',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE / RARE (linguistically significant, lower global profile)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'DR-quechua', region: 'South America', country: 'Peru',
    accent_name: 'Quechua (Runasimi)', language_family: 'Quechuan',
    iso_code: 'que', speaker_population: '8,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Imaynallan kashanki — "How are you?" The administrative language of the Inca Empire; co-official in Peru and Bolivia.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — largest indigenous language family of the Americas; co-official in Peru, Bolivia and Ecuador.',
    latitude: -13.5, longitude: -72.0, status: 'active',
  },
  {
    id: 'DR-guarani', region: 'South America', country: 'Paraguay',
    accent_name: 'Guaraní', language_family: 'Tupian',
    iso_code: 'grn', speaker_population: '6,500,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural/Urban', proficiency_level: 'Native',
    sample_text: 'Mba\'éichapa — "How are you?" The only indigenous language of the Americas that is an official national language (Paraguay).',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — co-official language of Paraguay; spoken by ~90% of the population regardless of ethnicity.',
    latitude: -23.0, longitude: -58.0, status: 'active',
  },
  {
    id: 'DR-nahuatl', region: 'Central America', country: 'Mexico',
    accent_name: 'Nahuatl (Nāhuatl)', language_family: 'Uto-Aztecan',
    iso_code: 'nah', speaker_population: '1,700,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Niltze — "Hello." Nahuatl gave English words like chocolate, tomato, avocado, and chilli.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — language of the Aztec empire; gave the world chocolate, tomato, avocado and chili.',
    latitude: 19.5, longitude: -99.0, status: 'active',
  },
  {
    id: 'DR-yucatec-maya', region: 'Central America', country: 'Mexico',
    accent_name: "Yucatec Maya (Màaya T'àan)", language_family: 'Mayan',
    iso_code: 'yua', speaker_population: '800,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: "Ba'ax ka wa'alik — \"How are you?\" A descendant of the language written in the Classic Maya script.",
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — spoken across the Yucatán Peninsula; descendant of the Classic Maya civilisation.',
    latitude: 20.5, longitude: -89.0, status: 'active',
  },
  {
    id: 'DR-zulu', region: 'Southern Africa', country: 'South Africa',
    accent_name: 'Zulu (isiZulu)', language_family: 'Niger-Congo (Bantu)',
    iso_code: 'zul', speaker_population: '14,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Sawubona — "I see you" (greeting). The most widely spoken home language in South Africa.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — one of 11 official languages of South Africa; largest home language in the country.',
    latitude: -27.0, longitude: 31.5, status: 'active',
  },
  {
    id: 'DR-xhosa', region: 'Southern Africa', country: 'South Africa',
    accent_name: 'Xhosa (isiXhosa)', language_family: 'Niger-Congo (Bantu)',
    iso_code: 'xho', speaker_population: '8,200,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Molo — "Hello" (to one person). Famous for its complex click consonants; Nelson Mandela\'s mother tongue.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — official language of South Africa; known for its click consonants; language of Nelson Mandela.',
    latitude: -32.0, longitude: 27.0, status: 'active',
  },
  {
    id: 'DR-tamazight', region: 'North Africa', country: 'Morocco',
    accent_name: 'Tamazight (Berber/Amazigh)', language_family: 'Afro-Asiatic (Berber)',
    iso_code: 'ber', speaker_population: '26,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural/Urban', proficiency_level: 'Native',
    sample_text: 'Azul — "Hello." Written in the ancient Tifinagh script; co-official in Morocco since 2011.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — co-official in Morocco and Algeria; uses the ancient Tifinagh script; spoken across North Africa and the Sahara.',
    latitude: 31.5, longitude: -5.5, status: 'active',
  },
  {
    id: 'DR-wolof', region: 'West Africa', country: 'Senegal',
    accent_name: 'Wolof', language_family: 'Niger-Congo (Atlantic)',
    iso_code: 'wol', speaker_population: '5,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Na nga def — "How are you?" The de facto national language of Senegal, spoken as L1 or L2 by over 80% of the population.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — de facto lingua franca of Senegal; spoken natively and as second language by ~80% of the population.',
    latitude: 14.7, longitude: -17.5, status: 'active',
  },
  {
    id: 'DR-tigrinya', region: 'East Africa', country: 'Eritrea',
    accent_name: 'Tigrinya (ትግርኛ)', language_family: 'Afro-Asiatic (Semitic)',
    iso_code: 'tir', speaker_population: '7,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Selam — "Peace / Hello." Written in the Ge\'ez (Ethiopic) script; official language of Eritrea.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — official language of Eritrea; also a recognised language in the Tigray region of Ethiopia.',
    latitude: 15.3, longitude: 38.9, status: 'active',
  },
  {
    id: 'DR-mongolian', region: 'Central Asia', country: 'Mongolia',
    accent_name: 'Mongolian (Монгол хэл)', language_family: 'Mongolic',
    iso_code: 'mon', speaker_population: '5,200,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Сайн байна уу (Sain baina uu) — "Hello." Written in the traditional Mongolian script (vertical) and Cyrillic.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — official language of Mongolia; also spoken in Inner Mongolia, China; uses both Cyrillic and traditional Mongolian scripts.',
    latitude: 47.0, longitude: 104.0, status: 'active',
  },
  {
    id: 'DR-dzongkha', region: 'South Asia', country: 'Bhutan',
    accent_name: 'Dzongkha (རྫོང་ཁ)', language_family: 'Sino-Tibetan',
    iso_code: 'dzo', speaker_population: '640,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Kuzu zangpo la — "Hello." The national language of the Kingdom of Bhutan; closely related to Tibetan.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — national language of Bhutan; written in the Tibetan script; part of the Tibetan language continuum.',
    latitude: 27.5, longitude: 90.4, status: 'active',
  },
  {
    id: 'DR-tok-pisin', region: 'Oceania', country: 'Papua New Guinea',
    accent_name: 'Tok Pisin', language_family: 'English-based creole',
    iso_code: 'tpi', speaker_population: '4,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native/L2',
    sample_text: 'Gutpela apinun — "Good afternoon." The English-based creole that unites the 800+ languages of Papua New Guinea.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — one of three official languages of Papua New Guinea; lingua franca connecting ~800 distinct language communities.',
    latitude: -6.0, longitude: 145.0, status: 'active',
  },
  {
    id: 'DR-haitian-creole', region: 'Caribbean', country: 'Haiti',
    accent_name: 'Haitian Creole (Kreyòl ayisyen)', language_family: 'French-based creole',
    iso_code: 'hat', speaker_population: '12,000,000',
    speaker_age_range: 'All ages', urban_rural: 'Urban/Rural', proficiency_level: 'Native',
    sample_text: 'Bonjou — "Hello." The French-based creole that grew from the plantation contact language of colonial Saint-Domingue.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — co-official language of Haiti alongside French; spoken by virtually all Haitians.',
    latitude: 18.9, longitude: -72.3, status: 'active',
  },
  {
    id: 'DR-dinka', region: 'East Africa', country: 'South Sudan',
    accent_name: 'Dinka (Thuɔŋjäŋ)', language_family: 'Nilo-Saharan (Nilotic)',
    iso_code: 'dip', speaker_population: '4,500,000',
    speaker_age_range: 'All ages', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Yin ë lɔ? — "How are you?" The largest language group in South Sudan; related to the Nuer language.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Active — the most widely spoken language group in South Sudan; several major dialect clusters.',
    latitude: 7.0, longitude: 29.5, status: 'active',
  },
  {
    id: 'DR-buryat', region: 'Central Asia', country: 'Russia',
    accent_name: 'Buryat (Буряад хэлэн)', language_family: 'Mongolic',
    iso_code: 'bua', speaker_population: '300,000',
    speaker_age_range: 'Older adults', urban_rural: 'Rural', proficiency_level: 'Native',
    sample_text: 'Sain uu — "Hello." The Mongolian language of the indigenous Buryat people of Siberia around Lake Baikal.',
    audio_source: null, direct_audio_url: null, license: null,
    additional_notes: 'Definitely Endangered — spoken around Lake Baikal; official in the Republic of Buryatia, Russia.',
    latitude: 53.0, longitude: 108.5, status: 'endangered',
  },
]

// ── Convert to dialect_recordings row format ──────────────────────────────────
const rows = RECORDS.map(r => ({
  id:                  r.id,
  region:              r.region              || null,
  country:             r.country             || null,
  accent_name:         r.accent_name         || null,
  language_family:     r.language_family     || null,
  iso_code:            r.iso_code            || null,
  speaker_population:  r.speaker_population  || null,
  speaker_age_range:   r.speaker_age_range   || null,
  speaker_gender:      r.speaker_gender      || null,
  urban_rural:         r.urban_rural         || null,
  proficiency_level:   r.proficiency_level   || null,
  recording_duration_s: null,
  sample_text:         r.sample_text         || null,
  audio_source:        r.audio_source        || null,
  direct_audio_url:    r.direct_audio_url    || null,
  license:             r.license             || null,
  additional_notes:    r.additional_notes    || null,
  status:              r.status,
}))

// ── Upsert ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Seeding ${rows.length} languages into dialect_recordings…`)
  let total = 0
  const BATCH = 50
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase
      .from('dialect_recordings')
      .upsert(batch, { onConflict: 'id' })
    if (error) console.error(`Batch error:`, error.message)
    else { total += batch.length; process.stdout.write(`\r  ${total}/${rows.length}…`) }
  }

  console.log('\n\nBreakdown:')
  const byStatus = rows.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a }, {})
  Object.entries(byStatus).forEach(([s, n]) => console.log(`  ${s}: ${n}`))
  console.log(`\nDone. ${total} records seeded into dialect_recordings.`)
}

main().catch(err => { console.error('Fatal:', err) })

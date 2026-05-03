-- ============================================================
-- DIALECT DECODER — Supabase Setup
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- 1. Reference dialect database (populated by seed script)
CREATE TABLE IF NOT EXISTS dialect_recordings (
  id TEXT PRIMARY KEY,
  region TEXT,
  country TEXT,
  accent_name TEXT,
  language_family TEXT,
  iso_code TEXT,
  speaker_population TEXT,
  speaker_age_range TEXT,
  speaker_gender TEXT,
  urban_rural TEXT,
  proficiency_level TEXT,
  recording_duration_s INTEGER,
  sample_text TEXT,
  audio_source TEXT,
  direct_audio_url TEXT,
  license TEXT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Community uploads (user submissions via the Upload tab)
CREATE TABLE IF NOT EXISTS community_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language_name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  town TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speaker_age_range TEXT,
  speaker_gender TEXT,
  description TEXT,
  audio_url TEXT,
  consent_given BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  is_verified BOOLEAN DEFAULT false
);

-- 3. Row Level Security
ALTER TABLE dialect_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_uploads ENABLE ROW LEVEL SECURITY;

-- Public read on both tables
CREATE POLICY "public_read_dialect_recordings"
  ON dialect_recordings FOR SELECT USING (true);

CREATE POLICY "public_read_community_uploads"
  ON community_uploads FOR SELECT USING (true);

-- Anonymous inserts allowed for seeding dialect_recordings (seed script uses anon key)
CREATE POLICY "anon_insert_dialect_recordings"
  ON dialect_recordings FOR INSERT TO anon WITH CHECK (true);

-- Anonymous inserts allowed for community uploads (must specify TO anon explicitly)
CREATE POLICY "anon_insert_community_uploads"
  ON community_uploads FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- After running this SQL:
-- 1. Go to Storage in the Supabase dashboard
-- 2. Create a new bucket named:  recordings
-- 3. Set it to Public (so audio URLs are publicly accessible)
-- ============================================================

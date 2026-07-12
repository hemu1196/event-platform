-- ============================================================
-- EventHub — Supabase SQL Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  date DATE NOT NULL,
  time TEXT,
  venue TEXT NOT NULL,
  category TEXT DEFAULT 'Technology',
  fee INTEGER DEFAULT 0,
  seats INTEGER DEFAULT 100,
  organizer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON public.registrations(registration_id);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Events: anyone can read
CREATE POLICY "Allow public read on events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Events: anyone can insert/update/delete (for demo - restrict in production)
CREATE POLICY "Allow all operations on events"
  ON public.events FOR ALL
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Registrations: anyone can read and insert
CREATE POLICY "Allow public read on registrations"
  ON public.registrations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on registrations"
  ON public.registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 5. SAMPLE DATA
INSERT INTO public.events (title, description, image, date, time, venue, category, fee, seats, organizer)
VALUES
(
  'TechFest 2026 — Annual Tech Summit',
  'The biggest annual technology festival bringing together innovators, developers, and entrepreneurs. Featuring keynotes from industry leaders, hands-on workshops, hackathons, and incredible networking opportunities. Explore cutting-edge AI, blockchain, cloud computing, and more.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  '2026-07-15', '09:00 AM',
  'NIT Auditorium, Hyderabad',
  'Technology', 299, 500, 'ACM Student Chapter'
),
(
  'HackVerse 2026 — 36-Hour Hackathon',
  'Join 500+ developers, designers, and innovators for an intense 36-hour hackathon. Build solutions for real-world problems across tracks including FinTech, HealthTech, EdTech, and Sustainability. Prizes worth ₹2,00,000 up for grabs!',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  '2026-07-28', '10:00 AM',
  'IIIT Hyderabad Campus',
  'Hackathon', 199, 300, 'Google Developer Student Club'
),
(
  'Cultural Fiesta — Annual College Fest',
  'Experience three days of unmatched cultural extravaganza. Dance battles, music performances, fashion shows, fine arts, drama, and so much more. Celebrities, DJ nights, food stalls — the ultimate college cultural experience!',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  '2026-08-05', '11:00 AM',
  'JNTU Open Air Theatre',
  'Cultural', 149, 1000, 'Cultural Committee'
),
(
  'CodeSprint — Competitive Programming Contest',
  'Put your algorithmic thinking and coding skills to the test in this high-intensity competitive programming contest. Problems range from easy to expert. Compete individually or as a team of two. Certificates for all participants.',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  '2026-08-12', '02:00 PM',
  'CS Department Lab, VIT Vellore',
  'Technology', 99, 200, 'Coding Club'
),
(
  'Business Conclave — Startup Pitching',
  'Present your startup idea to a panel of experienced VCs and angel investors. Win funding, mentorship, and incubation support. Network with 200+ entrepreneurs, attend masterclasses on funding, scaling, and go-to-market strategies.',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
  '2026-08-20', '10:00 AM',
  'IIM Bangalore, Seminar Hall',
  'Business', 499, 150, 'E-Cell IIM'
),
(
  'Sports Premier League — Inter-College',
  'The grand inter-college sports championship featuring Cricket, Football, Basketball, Volleyball, Badminton, and Athletics. Compete for the coveted Champions Trophy and win exciting prizes. Open to all college students.',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  '2026-09-01', '07:00 AM',
  'Gachibowli Stadium, Hyderabad',
  'Sports', 199, 800, 'Sports Committee'
);

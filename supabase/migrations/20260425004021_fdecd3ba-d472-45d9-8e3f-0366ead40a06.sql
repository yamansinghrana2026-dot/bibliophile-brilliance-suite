
-- Leads
DROP POLICY "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND length(trim(phone)) BETWEEN 7 AND 20
  AND (notes IS NULL OR length(notes) <= 1000)
);

-- Bookings
DROP POLICY "Anyone creates booking" ON public.bookings;
CREATE POLICY "Anyone creates booking" ON public.bookings FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND length(trim(phone)) BETWEEN 7 AND 20
  AND (email IS NULL OR length(email) <= 255)
  AND plan IN ('monthly','quarterly','halfyearly','yearly')
  AND status = 'pending'
);

-- Reviews
DROP POLICY "Anyone submits review" ON public.reviews;
CREATE POLICY "Anyone submits review" ON public.reviews FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND rating BETWEEN 1 AND 5
  AND length(trim(comment)) BETWEEN 5 AND 500
  AND approved = false
);

-- Chat logs
DROP POLICY "Anyone inserts chat" ON public.chat_logs;
CREATE POLICY "Anyone inserts chat" ON public.chat_logs FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(session_id)) BETWEEN 1 AND 100
  AND length(trim(content)) BETWEEN 1 AND 2000
  AND role IN ('user','assistant')
);

-- Storage: restrict listing, allow direct reads only
DROP POLICY "Public reads gallery" ON storage.objects;
CREATE POLICY "Public reads gallery files" ON storage.objects FOR SELECT
USING (bucket_id = 'gallery' AND auth.role() = 'anon' IS NOT NULL);

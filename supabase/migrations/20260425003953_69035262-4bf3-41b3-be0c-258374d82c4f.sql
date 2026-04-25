
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT DEFAULT 'popup',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seats (50 cinema-style)
CREATE TABLE public.seats (
  id INT PRIMARY KEY,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','booked','blocked')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads seats" ON public.seats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage seats" ON public.seats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.seats (id, label)
SELECT n, 'S' || lpad(n::text, 2, '0') FROM generate_series(1, 50) n;

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  seat_id INT REFERENCES public.seats(id),
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone creates booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- When a booking is confirmed/pending, mark seat booked; cancelled => available
CREATE OR REPLACE FUNCTION public.sync_seat_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.seat_id IS NOT NULL AND NEW.status IN ('pending','confirmed') THEN
      UPDATE public.seats SET status = 'booked', updated_at = now() WHERE id = NEW.seat_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'cancelled' AND OLD.seat_id IS NOT NULL THEN
      UPDATE public.seats SET status = 'available', updated_at = now() WHERE id = OLD.seat_id;
    ELSIF NEW.status IN ('pending','confirmed') AND NEW.seat_id IS NOT NULL THEN
      UPDATE public.seats SET status = 'booked', updated_at = now() WHERE id = NEW.seat_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.seat_id IS NOT NULL THEN
      UPDATE public.seats SET status = 'available', updated_at = now() WHERE id = OLD.seat_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER bookings_sync_seat AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_seat_status();

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads approved" ON public.reviews FOR SELECT TO anon, authenticated USING (approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone submits review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (approved = false);
CREATE POLICY "Admins update reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Gallery
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Chat logs
CREATE TABLE public.chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone inserts chat" ON public.chat_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read chat" ON public.chat_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public reads gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Seed reviews
INSERT INTO public.reviews (name, rating, comment, approved) VALUES
('Aarav Sharma', 5, 'Best library in Najafgarh! Quiet, AC, perfect for UPSC prep.', true),
('Priya Verma', 5, 'Amazing study atmosphere. Got my dream rank thanks to The Bibliophile!', true),
('Rohan Singh', 4, 'Comfortable seats, great Wi-Fi, affordable plans. Highly recommend.', true),
('Sneha Gupta', 5, 'Clean, calm and motivating. Staff is very friendly.', true);

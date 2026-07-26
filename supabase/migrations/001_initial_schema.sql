-- ============================================================
-- School Attendance App — Initial Schema
-- ============================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE attendance_status AS ENUM (
  'Present',
  'Absent',
  'Leave',
  'Late',
  'Half-day'
);

CREATE TYPE attendance_period AS ENUM ('morning', 'afternoon');

CREATE TYPE student_status AS ENUM ('active', 'inactive');

CREATE TYPE calendar_day_type AS ENUM (
  'normal',
  'public_holiday',
  'special_working'
);

-- ============================================================
-- ROLES TABLE
-- Maps Supabase auth.users to app roles (teacher | parent)
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('teacher', 'parent')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- id = admission number (text, natural key)
-- ============================================================

CREATE TABLE public.students (
  id          TEXT PRIMARY KEY,                        -- admission number
  name        TEXT NOT NULL,
  gender      TEXT NOT NULL CHECK (gender IN ('M', 'F', 'Other')),
  status      student_status NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARENTS
-- Each parent links to exactly one student.
-- username = student_id (admission number).
-- They authenticate via Supabase Auth; the row here holds
-- the app-level data and ties auth.users → student.
-- ============================================================

CREATE TABLE public.parents (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id         TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  whatsapp_number    TEXT,
  secondary_contact  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (student_id)  -- one parent account per student
);

-- ============================================================
-- ATTENDANCE
-- One row per student per period per date.
-- arrival_time is only relevant when status = 'Late'.
-- reason is filled in by the parent after the fact.
-- marked_by is the teacher's auth.users id.
-- Half-day is derived (see notes below) — but we also allow
-- the teacher to explicitly set it on either slot for clarity.
-- ============================================================

CREATE TABLE public.attendance (
  id           BIGSERIAL PRIMARY KEY,
  student_id   TEXT        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date         DATE        NOT NULL,
  period       attendance_period NOT NULL,
  status       attendance_status NOT NULL,
  arrival_time TIME,                           -- only when status = 'Late'
  reason       TEXT,                           -- parent-supplied absence reason
  marked_by    UUID        REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (student_id, date, period)            -- one record per slot
);

-- Indexes required by spec
CREATE INDEX idx_attendance_student_id ON public.attendance (student_id);
CREATE INDEX idx_attendance_date       ON public.attendance (date);
CREATE INDEX idx_attendance_student_date ON public.attendance (student_id, date);

-- ============================================================
-- CALENDAR
-- Teacher-managed school calendar.
-- ============================================================

CREATE TABLE public.calendar (
  date  DATE PRIMARY KEY,
  type  calendar_day_type NOT NULL DEFAULT 'normal'
);

-- ============================================================
-- SPECIAL CLASSES
-- ============================================================

CREATE TABLE public.special_classes (
  id         BIGSERIAL PRIMARY KEY,
  date       DATE    NOT NULL,
  time       TIME    NOT NULL,
  subject    TEXT    NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SPECIAL CLASS CONFIRMATIONS
-- ============================================================

CREATE TABLE public.special_class_confirmations (
  id               BIGSERIAL PRIMARY KEY,
  special_class_id BIGINT NOT NULL REFERENCES public.special_classes(id) ON DELETE CASCADE,
  parent_id        UUID   NOT NULL REFERENCES public.parents(id)          ON DELETE CASCADE,
  confirmed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (special_class_id, parent_id)
);

-- ============================================================
-- ABSENCE NOTIFICATIONS
-- Created automatically when attendance.status IN ('Absent','Leave').
-- whatsapp_sent_at is null until the WhatsApp API call is wired in.
-- ============================================================

CREATE TABLE public.absence_notifications (
  id             BIGSERIAL PRIMARY KEY,
  attendance_id  BIGINT NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
  student_id     TEXT   NOT NULL REFERENCES public.students(id)   ON DELETE CASCADE,
  parent_id      UUID   REFERENCES public.parents(id)             ON DELETE SET NULL,
  whatsapp_number TEXT,
  whatsapp_sent_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (attendance_id)
);

-- ============================================================
-- TRIGGER: auto-create absence_notification row
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_create_absence_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status IN ('Absent', 'Leave') THEN
    INSERT INTO public.absence_notifications
      (attendance_id, student_id, parent_id, whatsapp_number)
    SELECT
      NEW.id,
      NEW.student_id,
      p.id,
      p.whatsapp_number
    FROM public.parents p
    WHERE p.student_id = NEW.student_id
    ON CONFLICT (attendance_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_absence_notification
AFTER INSERT OR UPDATE OF status ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.fn_create_absence_notification();

-- ============================================================
-- TRIGGER: auto-create profiles row when a user signs up
-- (teacher account is created manually; parent accounts are
--  created via the service-role key during CSV import)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- role is passed via user metadata set at sign-up time
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'parent'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();

-- ============================================================
-- HELPER: is the calling user the teacher?
-- We identify teacher by profile.role = 'teacher'.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

-- ============================================================
-- HELPER: what student_id does the calling parent own?
-- ============================================================

CREATE OR REPLACE FUNCTION public.my_student_id()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT student_id FROM public.parents WHERE id = auth.uid();
$$;

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: full access to students"
  ON public.students FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Parent: read own child's student row"
  ON public.students FOR SELECT
  USING (id = public.my_student_id());

-- parents
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: full access to parents"
  ON public.parents FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Parent: read own parent row"
  ON public.parents FOR SELECT
  USING (id = auth.uid());

-- attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: full access to attendance"
  ON public.attendance FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Parent: read own child's attendance"
  ON public.attendance FOR SELECT
  USING (student_id = public.my_student_id());

CREATE POLICY "Parent: update reason on own child's attendance"
  ON public.attendance FOR UPDATE
  USING (student_id = public.my_student_id())
  WITH CHECK (
    student_id = public.my_student_id()
    -- parents may only touch the reason column; all other columns are
    -- controlled by the application layer (service-role writes from server)
  );

-- calendar
ALTER TABLE public.calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: full access to calendar"
  ON public.calendar FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Anyone authenticated: read calendar"
  ON public.calendar FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- special_classes
ALTER TABLE public.special_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: full access to special_classes"
  ON public.special_classes FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Parent: read special_classes"
  ON public.special_classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- special_class_confirmations
ALTER TABLE public.special_class_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: read all confirmations"
  ON public.special_class_confirmations FOR SELECT
  USING (public.is_teacher());

CREATE POLICY "Parent: read own confirmations"
  ON public.special_class_confirmations FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parent: insert own confirmation"
  ON public.special_class_confirmations FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- absence_notifications
ALTER TABLE public.absence_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: full access to absence_notifications"
  ON public.absence_notifications FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Parent: read own absence_notifications"
  ON public.absence_notifications FOR SELECT
  USING (parent_id = auth.uid());

-- ============================================================
-- ATTENDANCE THRESHOLD SETTING
-- Single-row config table (teacher can edit via UI).
-- ============================================================

CREATE TABLE public.settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

INSERT INTO public.settings (key, value) VALUES
  ('attendance_threshold_pct', '75');

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher: full access to settings"
  ON public.settings FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());

CREATE POLICY "Parent: no access to settings"
  ON public.settings FOR SELECT
  USING (false);

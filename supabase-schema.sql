-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  employee_id uuid,
  weekday integer CHECK (weekday >= 0 AND weekday <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  CONSTRAINT availability_pkey PRIMARY KEY (id),
  CONSTRAINT availability_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT availability_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  profile_id uuid,
  full_name text NOT NULL,
  avatar_url text,
  position_id uuid,
  hourly_rate numeric,
  active boolean DEFAULT true,
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT employees_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT employees_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id)
);
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  name text NOT NULL,
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT locations_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.memberships (
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'employee'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'employee'::text])),
  CONSTRAINT memberships_pkey PRIMARY KEY (user_id, org_id),
  CONSTRAINT memberships_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT news_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.org_join_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  code text NOT NULL UNIQUE CHECK (code = upper(code)),
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'employee'::text])),
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT org_join_codes_pkey PRIMARY KEY (id),
  CONSTRAINT org_join_codes_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT org_join_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.positions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  name text NOT NULL,
  color text DEFAULT '#22c55e'::text,
  CONSTRAINT positions_pkey PRIMARY KEY (id),
  CONSTRAINT positions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  active_org_id uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_active_org_id_fkey FOREIGN KEY (active_org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  employee_id uuid,
  location_id uuid,
  position_id uuid,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  break_minutes integer DEFAULT 0,
  notes text,
  status text DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'published'::text, 'completed'::text, 'cancelled'::text])),
  CONSTRAINT shifts_pkey PRIMARY KEY (id),
  CONSTRAINT shifts_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT shifts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT shifts_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT shifts_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id)
);
CREATE TABLE public.time_off (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  employee_id uuid,
  starts_at date NOT NULL,
  ends_at date NOT NULL,
  type text DEFAULT 'other'::text CHECK (type = ANY (ARRAY['vacation'::text, 'sick'::text, 'unpaid'::text, 'other'::text])),
  reason text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text])),
  created_by uuid,
  CONSTRAINT time_off_pkey PRIMARY KEY (id),
  CONSTRAINT time_off_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT time_off_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
  CONSTRAINT time_off_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
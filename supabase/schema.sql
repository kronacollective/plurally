-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user uuid NOT NULL,
  username text NOT NULL UNIQUE,
  display_name text,
  description text,
  color text,
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_user_fkey FOREIGN KEY (user) REFERENCES auth.users(id)
);
CREATE TABLE public.fronts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  member text NOT NULL,
  start timestamp with time zone NOT NULL DEFAULT now(),
  end timestamp with time zone,
  message text,
  CONSTRAINT fronts_pkey PRIMARY KEY (id),
  CONSTRAINT fronts_member_fkey FOREIGN KEY (member) REFERENCES public.members(id)
);
CREATE TABLE public.members (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  pronouns text,
  description text,
  avatar text,
  user uuid,
  color text NOT NULL DEFAULT '0, 0, 0'::text,
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_user_fkey FOREIGN KEY (user) REFERENCES auth.users(id)
);
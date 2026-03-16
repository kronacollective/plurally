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
CREATE TABLE public.bucket_friends (
  bucket uuid NOT NULL,
  account uuid NOT NULL,
  CONSTRAINT bucket_friends_pkey PRIMARY KEY (bucket, account),
  CONSTRAINT bucket_friends_bucket_fkey FOREIGN KEY (bucket) REFERENCES public.buckets(id),
  CONSTRAINT bucket_friends_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
);
CREATE TABLE public.bucket_members (
  bucket uuid NOT NULL,
  member text NOT NULL,
  CONSTRAINT bucket_members_pkey PRIMARY KEY (bucket, member),
  CONSTRAINT bucket_members_bucket_fkey FOREIGN KEY (bucket) REFERENCES public.buckets(id),
  CONSTRAINT bucket_members_member_fkey FOREIGN KEY (member) REFERENCES public.members(id)
);
CREATE TABLE public.buckets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  account uuid NOT NULL,
  color text DEFAULT '255, 255, 255'::text,
  CONSTRAINT buckets_pkey PRIMARY KEY (id),
  CONSTRAINT buckets_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
);
CREATE TABLE public.friends (
  relating uuid NOT NULL,
  related uuid NOT NULL,
  accepted boolean NOT NULL,
  CONSTRAINT friends_pkey PRIMARY KEY (relating, related),
  CONSTRAINT friends_relating_fkey FOREIGN KEY (relating) REFERENCES public.accounts(id),
  CONSTRAINT friends_related_fkey FOREIGN KEY (related) REFERENCES public.accounts(id)
);
CREATE TABLE public.fronts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  member text NOT NULL,
  start timestamp with time zone NOT NULL DEFAULT now(),
  end timestamp with time zone,
  message text,
  account uuid,
  CONSTRAINT fronts_pkey PRIMARY KEY (id),
  CONSTRAINT fronts_member_fkey FOREIGN KEY (member) REFERENCES public.members(id),
  CONSTRAINT fronts_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
);
CREATE TABLE public.members (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  pronouns text,
  description text,
  avatar text,
  color text NOT NULL DEFAULT '0, 0, 0'::text,
  account uuid,
  is_status boolean NOT NULL DEFAULT false,
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
);
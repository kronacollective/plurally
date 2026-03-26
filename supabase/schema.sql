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
  sp_key text,
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_user_fkey FOREIGN KEY (user) REFERENCES auth.users(id)
);
CREATE TABLE public.bucket_fields (
  bucket uuid NOT NULL,
  field uuid NOT NULL,
  CONSTRAINT bucket_fields_pkey PRIMARY KEY (bucket, field),
  CONSTRAINT bucket_fields_bucket_fkey FOREIGN KEY (bucket) REFERENCES public.buckets(id),
  CONSTRAINT bucket_fields_field_fkey FOREIGN KEY (field) REFERENCES public.fields(id)
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
CREATE TABLE public.field_values (
  field uuid NOT NULL DEFAULT gen_random_uuid(),
  member text NOT NULL,
  value json,
  CONSTRAINT field_values_pkey PRIMARY KEY (field, member),
  CONSTRAINT field_values_field_fkey FOREIGN KEY (field) REFERENCES public.fields(id),
  CONSTRAINT field_values_member_fkey FOREIGN KEY (member) REFERENCES public.members(id)
);
CREATE TABLE public.fields (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'text'::text,
  CONSTRAINT fields_pkey PRIMARY KEY (id),
  CONSTRAINT fields_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
);
CREATE TABLE public.folder_members (
  folder uuid NOT NULL,
  member text NOT NULL DEFAULT ''::text,
  CONSTRAINT folder_members_pkey PRIMARY KEY (folder, member),
  CONSTRAINT folder_members_folder_fkey FOREIGN KEY (folder) REFERENCES public.folders(id),
  CONSTRAINT folder_members_member_fkey FOREIGN KEY (member) REFERENCES public.members(id)
);
CREATE TABLE public.folders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  description text,
  color text,
  subfolder_of uuid,
  account uuid NOT NULL,
  CONSTRAINT folders_pkey PRIMARY KEY (id),
  CONSTRAINT folders_subfolder_of_fkey FOREIGN KEY (subfolder_of) REFERENCES public.folders(id),
  CONSTRAINT folders_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
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
  archived boolean NOT NULL DEFAULT false,
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
);
CREATE TABLE public.subscriptions (
  account uuid NOT NULL,
  subscription jsonb NOT NULL,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (account),
  CONSTRAINT subscriptions_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id)
);
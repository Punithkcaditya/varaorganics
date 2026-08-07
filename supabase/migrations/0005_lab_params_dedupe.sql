-- Fix #1 — lab_parameters duplication.
--
-- The seed insert had no conflict guard and the table had no unique key, so
-- running seed.sql more than once inserted duplicate parameter rows for the
-- same batch. The homepage hero card renders slice(0,4) of the params ordered
-- by position, so with duplicates it showed Moisture/Butyric twice and dropped
-- Antibiotics/Heavy metals.
--
-- This migration is idempotent and safe to run on the live database.

-- 1. Remove existing duplicates, keeping the lowest ctid per (batch_id, name).
delete from public.lab_parameters a
using public.lab_parameters b
where a.batch_id = b.batch_id
  and lower(btrim(a.name)) = lower(btrim(b.name))
  and a.ctid > b.ctid;

-- 2. Prevent it happening again.
alter table public.lab_parameters
  drop constraint if exists lab_parameters_batch_name_key;
alter table public.lab_parameters
  add constraint lab_parameters_batch_name_key unique (batch_id, name);

-- Migration 011 — Add started_at and completed_at timestamp columns to events
-- started_at: set automatically when admin clicks "Go Live" (via updateEvent)
-- completed_at: set automatically when admin clicks "Mark Complete"

alter table public.events
  add column if not exists started_at   timestamptz,
  add column if not exists completed_at timestamptz;

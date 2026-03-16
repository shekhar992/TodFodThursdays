-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008 — Add data jsonb column to events
-- Stores rich event fields: emoji, format, duration, rules, pointsBreakdown
-- Run in Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.events
  add column if not exists data jsonb not null default '{}'::jsonb;

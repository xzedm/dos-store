-- Add badges column to products table if it doesn't exist.
-- Run this in Supabase SQL Editor.

alter table public.products
add column if not exists badges text[] default null;

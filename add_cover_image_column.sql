-- Migration: Add cover_image column to modules table
-- Execute this SQL in your Supabase SQL Editor

-- Add cover_image column to modules table
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Add comment to document the column
COMMENT ON COLUMN modules.cover_image IS 'Base64 encoded cover image for the module (optimized to ~500KB)';

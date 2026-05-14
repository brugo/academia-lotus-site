-- Migration: Add rich text support fields to services table
-- Adds: show_booking_button, whatsapp_number, whatsapp_button_text

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS show_booking_button BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_button_text TEXT DEFAULT '';

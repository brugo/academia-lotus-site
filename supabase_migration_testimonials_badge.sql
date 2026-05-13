-- Add badge_text to testimonials table
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS badge_text text;

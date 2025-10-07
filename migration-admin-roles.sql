-- Migration: Update admin system to support Super Admin (2) and Light Admin (1)
--
-- Changes:
-- 1. is_admin column now supports 3 values:
--    - 0: Regular user
--    - 1: Light Admin (can view/edit, no delete)
--    - 2: Super Admin (full access)

-- First, backup existing is_admin values
-- All current admins (is_admin = 1) will become Super Admins (is_admin = 2)

-- Update existing admins to super admins
UPDATE user
SET is_admin = 2
WHERE is_admin = 1;

-- The is_admin column is already a tinyint, which supports values 0, 1, 2
-- No ALTER TABLE needed

-- Optional: Add a comment to document the new structure
ALTER TABLE user
MODIFY COLUMN is_admin tinyint(1) DEFAULT '0' COMMENT '0=user, 1=light_admin, 2=super_admin';

-- Add created_at (upload_date) column to uploaded table if it doesn't exist
ALTER TABLE uploaded
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
COMMENT 'Upload date/time of the button';

-- Success message
SELECT 'Migration completed: Admin roles and upload_date updated successfully' AS status;

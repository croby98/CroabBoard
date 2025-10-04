-- Add missing columns to deleted_button table for proper restoration

-- Check if columns exist and add them if missing
SET @dbname = DATABASE();
SET @tablename = 'deleted_button';

-- Add uploaded_id column
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'uploaded_id') > 0,
  'SELECT 1',
  'ALTER TABLE deleted_button ADD COLUMN uploaded_id INT DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add image_id column
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'image_id') > 0,
  'SELECT 1',
  'ALTER TABLE deleted_button ADD COLUMN image_id INT DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add sound_id column
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'sound_id') > 0,
  'SELECT 1',
  'ALTER TABLE deleted_button ADD COLUMN sound_id INT DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add category_id column
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'category_id') > 0,
  'SELECT 1',
  'ALTER TABLE deleted_button ADD COLUMN category_id INT DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add indexes for better performance (these won't fail if they already exist)
CREATE INDEX idx_deleted_button_owner ON deleted_button(owner_id);
CREATE INDEX idx_deleted_button_status ON deleted_button(status);
CREATE INDEX idx_deleted_button_uploaded ON deleted_button(uploaded_id);

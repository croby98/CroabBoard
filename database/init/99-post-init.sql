-- CroabBoard Post-Initialization Script
-- This script runs after all data has been imported

USE croabboard;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_linked_user_tri ON linked(user_id, tri);
CREATE INDEX IF NOT EXISTS idx_uploaded_category ON uploaded(category_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_user ON uploaded(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_type ON file(type);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_button_stats_count ON button_stats(play_count);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorite(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_date ON play_history(played_at);

-- Update any AUTO_INCREMENT values to ensure proper sequence
ALTER TABLE user AUTO_INCREMENT = 1000;
ALTER TABLE category AUTO_INCREMENT = 100;
ALTER TABLE file AUTO_INCREMENT = 10000;
ALTER TABLE uploaded AUTO_INCREMENT = 1000;

-- Ensure proper charset and collation for all tables
ALTER TABLE user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE category CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE file CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE uploaded CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE linked CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a default admin user if no users exist (for fresh installations)
INSERT IGNORE INTO user (id, username, password, is_admin, btn_size)
VALUES (1, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs2Gt9hxzG', 1, 150);
-- Default password is 'admin123' - CHANGE THIS IN PRODUCTION!

-- Insert default categories if none exist
INSERT IGNORE INTO category (id, name, color) VALUES
(1, 'General', '#3B82F6'),
(2, 'Comedy', '#F59E0B'),
(3, 'Music', '#10B981'),
(4, 'Effects', '#8B5CF6'),
(5, 'Games', '#EF4444');

-- Create a view for easy button management
CREATE OR REPLACE VIEW button_overview AS
SELECT
    u.id as button_id,
    u.button_name,
    u.uploaded_by,
    usr.username as uploaded_by_name,
    c.name as category_name,
    c.color as category_color,
    img.filename as image_filename,
    snd.filename as sound_filename,
    COUNT(l.id) as linked_count,
    bs.play_count,
    bs.last_played
FROM uploaded u
LEFT JOIN user usr ON u.uploaded_by = usr.id
LEFT JOIN category c ON u.category_id = c.id
LEFT JOIN file img ON u.image_id = img.id
LEFT JOIN file snd ON u.sound_id = snd.id
LEFT JOIN linked l ON u.id = l.uploaded_id
LEFT JOIN button_stats bs ON u.id = bs.uploaded_id
GROUP BY u.id;

-- Final status report
SELECT 'Database initialization completed successfully!' AS Status;
SELECT NOW() AS CompletionTime;
SELECT COUNT(*) as total_users FROM user;
SELECT COUNT(*) as total_categories FROM category;
SELECT COUNT(*) as total_files FROM file;
SELECT COUNT(*) as total_buttons FROM uploaded;
SELECT COUNT(*) as total_links FROM linked;

-- Commit all changes
COMMIT;
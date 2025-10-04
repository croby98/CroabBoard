-- Insert default categories with different colors
-- Run this file to populate the database with default categories

INSERT IGNORE INTO category (name, color) VALUES
('Music', '#3b82f6'),       -- Blue
('Sound Effects', '#10b981'), -- Green
('Voice', '#8b5cf6'),        -- Purple
('Memes', '#f59e0b'),        -- Orange
('Ambiance', '#06b6d4'),     -- Cyan
('Alarms', '#ef4444'),       -- Red
('Animals', '#84cc16'),      -- Lime
('Nature', '#14b8a6'),       -- Teal
('Gaming', '#a855f7'),       -- Violet
('Comedy', '#f97316'),       -- Orange-Red
('Horror', '#71717a'),       -- Gray
('Sci-Fi', '#6366f1');       -- Indigo

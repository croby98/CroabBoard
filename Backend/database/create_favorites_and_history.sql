-- Create favorites table for user's favorite buttons
CREATE TABLE IF NOT EXISTS favorite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    uploaded_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_favorite (user_id, uploaded_id),
    INDEX idx_user_favorites (user_id),
    INDEX idx_uploaded_favorites (uploaded_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create play_history table for tracking recently played sounds
CREATE TABLE IF NOT EXISTS play_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    uploaded_id INT NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_history (user_id, played_at DESC),
    INDEX idx_uploaded_history (uploaded_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create button_stats table for tracking button usage statistics
CREATE TABLE IF NOT EXISTS button_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uploaded_id INT NOT NULL,
    play_count INT DEFAULT 0,
    last_played TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_button_stats (uploaded_id),
    INDEX idx_play_count (play_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

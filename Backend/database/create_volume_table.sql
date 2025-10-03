-- Create button_volume table for storing individual button volume preferences per user
-- Using simple constraints without foreign keys to avoid reference errors
CREATE TABLE IF NOT EXISTS button_volume (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    uploaded_id INT NOT NULL,
    volume DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_button (user_id, uploaded_id),
    INDEX idx_user_volumes (user_id),
    INDEX idx_uploaded_id (uploaded_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

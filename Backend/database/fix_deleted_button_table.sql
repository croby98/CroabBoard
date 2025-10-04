-- Fix deleted_button table structure
-- This creates the table from scratch if needed or alters existing one

-- Check current structure and recreate if necessary
DROP TABLE IF EXISTS deleted_button;

CREATE TABLE deleted_button (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    uploaded_id INT DEFAULT NULL,
    button_name VARCHAR(255) NOT NULL,
    sound_filename VARCHAR(255) DEFAULT NULL,
    image_filename VARCHAR(255) DEFAULT NULL,
    image_id INT DEFAULT NULL,
    sound_id INT DEFAULT NULL,
    category_id INT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'deleted',
    delete_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_deleted_button_owner (owner_id),
    INDEX idx_deleted_button_status (status),
    INDEX idx_deleted_button_uploaded (uploaded_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

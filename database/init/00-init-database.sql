-- CroabBoard Database Initialization Script
-- This script runs before the main database dump to prepare the environment

-- Create database if it doesn't exist (though it should be created by docker-compose)
CREATE DATABASE IF NOT EXISTS croabboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE croabboard;

-- Set proper SQL mode for consistent behavior
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- Set timezone
SET time_zone = "+00:00";

-- Configure MySQL settings for better performance
SET GLOBAL innodb_buffer_pool_size = 128 * 1024 * 1024; -- 128MB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 32 * 1024 * 1024; -- 32MB

-- Log initialization
SELECT 'CroabBoard database initialization started' AS Status;
SELECT NOW() AS InitTime;

COMMIT;
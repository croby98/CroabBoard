-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: crobboard
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,NULL,'anonymous','login_success','{\"method\":\"POST\",\"path\":\"/api/login\",\"username\":\"Croby\",\"userId\":1,\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 14:21:36'),(2,NULL,'anonymous','login_success','{\"method\":\"POST\",\"path\":\"/api/login\",\"username\":\"Croby\",\"userId\":1,\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 14:34:27'),(3,1,'Croby','avatar_updated','{\"method\":\"POST\",\"path\":\"/avatar\",\"filename\":\"1_1759588491892.png\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 14:34:51'),(4,NULL,'anonymous','login_success','{\"method\":\"POST\",\"path\":\"/api/login\",\"username\":\"Croby\",\"userId\":1,\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 14:37:38'),(5,NULL,'anonymous','login_success','{\"method\":\"POST\",\"path\":\"/api/login\",\"username\":\"Croby\",\"userId\":1,\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 14:55:53'),(6,NULL,'anonymous','login_success','{\"method\":\"POST\",\"path\":\"/api/login\",\"username\":\"Croby\",\"userId\":1,\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 15:00:39'),(7,NULL,'anonymous','login_success','{\"method\":\"POST\",\"path\":\"/api/login\",\"username\":\"Croby\",\"userId\":1,\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 15:02:58'),(8,1,'Croby','admin_status_changed','{\"method\":\"POST\",\"path\":\"/users/11/toggle-admin\",\"targetUserId\":\"11\",\"targetUsername\":\"Test\",\"newStatus\":true}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 15:06:44'),(9,NULL,'anonymous','login_success','{\"method\":\"POST\",\"path\":\"/api/login\",\"username\":\"Croby\",\"userId\":1,\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:08:50'),(10,1,'Croby','button_restored','{\"method\":\"POST\",\"path\":\"/deleted-buttons/1/restore\",\"deletedButtonId\":\"1\",\"buttonName\":\"Ah\",\"ownerId\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:12:47'),(11,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:25:30'),(12,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:33:06'),(13,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:37:06'),(14,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:39:02'),(15,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:44:40'),(16,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:47:23'),(17,1,'Croby','button_delete','{\"buttonId\":\"283\",\"button_name\":\"test\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:48:20'),(18,1,'Croby','button_delete','{\"buttonId\":\"37\",\"button_name\":\"Unknown\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:48:34'),(19,1,'Croby','button_delete','{\"buttonId\":\"47\",\"button_name\":\"Unknown\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:48:39'),(20,1,'Croby','button_delete','{\"buttonId\":\"51\",\"button_name\":\"Unknown\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:48:42'),(21,1,'Croby','button_delete','{\"buttonId\":\"108\",\"button_name\":\"Mario2.png\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:48:46'),(22,1,'Croby','button_delete','{\"buttonId\":\"169\",\"button_name\":\"Mario-Non.png\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:48:53'),(23,1,'Croby','button_delete','{\"buttonId\":\"178\",\"button_name\":\"flemme.jpg\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:48:55'),(24,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-04 19:57:44'),(25,1,'Croby','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 15:35:36'),(26,1,'Croby','login_success','{\"isAdmin\":2}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:06:19'),(27,11,'Test','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:09:52'),(28,1,'Croby','login_success','{\"isAdmin\":2}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:10:32'),(29,11,'Test','login_failed','{\"reason\":\"invalid_password\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:11:30'),(30,11,'Test','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:11:33'),(31,1,'Croby','login_success','{\"isAdmin\":2}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:15:29'),(32,1,'Croby','login_success','{\"isAdmin\":2}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:17:13'),(33,1,'Croby','login_success','{\"isAdmin\":2}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:18:39'),(34,11,'Test','login_failed','{\"reason\":\"invalid_password\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:28:07'),(35,11,'Test','login_success','{\"isAdmin\":1}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-07 19:28:09');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `button_stats`
--

DROP TABLE IF EXISTS `button_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `button_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uploaded_id` int NOT NULL,
  `play_count` int DEFAULT '0',
  `last_played` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_button_stats` (`uploaded_id`),
  KEY `idx_play_count` (`play_count` DESC)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `button_stats`
--

LOCK TABLES `button_stats` WRITE;
/*!40000 ALTER TABLE `button_stats` DISABLE KEYS */;
INSERT INTO `button_stats` VALUES (1,94,13,'2025-10-04 19:53:43','2025-10-03 18:37:40','2025-10-04 19:53:43'),(2,104,3,'2025-10-03 19:06:02','2025-10-03 18:37:44','2025-10-03 19:06:02'),(3,76,51,'2025-10-04 09:50:25','2025-10-03 18:37:56','2025-10-04 09:50:25'),(4,193,48,'2025-10-04 11:04:56','2025-10-03 18:41:22','2025-10-04 11:04:56'),(5,88,3,'2025-10-03 19:00:19','2025-10-03 18:41:37','2025-10-03 19:00:19'),(6,187,4,'2025-10-04 15:16:03','2025-10-03 18:41:40','2025-10-04 15:16:03'),(7,93,7,'2025-10-07 19:07:13','2025-10-03 18:47:55','2025-10-07 19:07:13'),(8,196,7,'2025-10-07 19:15:35','2025-10-03 18:48:14','2025-10-07 19:15:35'),(9,195,3,'2025-10-03 20:36:41','2025-10-03 18:48:15','2025-10-03 20:36:41'),(10,267,8,'2025-10-03 19:25:20','2025-10-03 18:48:18','2025-10-03 19:25:20'),(11,272,4,'2025-10-04 19:14:54','2025-10-03 18:48:20','2025-10-04 19:14:54'),(12,252,12,'2025-10-04 15:47:59','2025-10-03 18:48:30','2025-10-04 15:47:59'),(13,194,12,'2025-10-07 19:18:42','2025-10-03 18:54:47','2025-10-07 19:18:42'),(14,262,50,'2025-10-04 15:38:41','2025-10-03 18:55:22','2025-10-04 15:38:41'),(15,233,8,'2025-10-07 15:37:41','2025-10-03 18:58:40','2025-10-07 15:37:41'),(16,52,1,'2025-10-03 18:58:59','2025-10-03 18:58:59','2025-10-03 18:58:59'),(17,284,4,'2025-10-04 15:38:47','2025-10-03 18:59:19','2025-10-04 15:38:47'),(18,239,3,'2025-10-04 11:43:19','2025-10-03 19:00:38','2025-10-04 11:43:19'),(19,91,3,'2025-10-04 14:56:22','2025-10-03 19:03:33','2025-10-04 14:56:22'),(20,79,1,'2025-10-03 19:06:10','2025-10-03 19:06:10','2025-10-03 19:06:10'),(21,89,1,'2025-10-03 19:06:11','2025-10-03 19:06:11','2025-10-03 19:06:11'),(22,81,7,'2025-10-07 19:13:14','2025-10-03 19:08:32','2025-10-07 19:13:14'),(23,80,1,'2025-10-03 19:08:34','2025-10-03 19:08:34','2025-10-03 19:08:34'),(24,238,1,'2025-10-03 19:25:12','2025-10-03 19:25:12','2025-10-03 19:25:12'),(25,266,4,'2025-10-04 15:38:43','2025-10-03 19:25:14','2025-10-04 15:38:43'),(26,112,3,'2025-10-04 15:38:40','2025-10-03 19:25:22','2025-10-04 15:38:40'),(27,125,1,'2025-10-03 20:36:42','2025-10-03 20:36:42','2025-10-03 20:36:42'),(28,39,1,'2025-10-03 20:36:45','2025-10-03 20:36:45','2025-10-03 20:36:45'),(29,183,1,'2025-10-03 20:37:03','2025-10-03 20:37:03','2025-10-03 20:37:03'),(30,241,1,'2025-10-03 20:37:10','2025-10-03 20:37:10','2025-10-03 20:37:10'),(31,92,2,'2025-10-04 15:16:10','2025-10-03 20:45:29','2025-10-04 15:16:10'),(32,145,2,'2025-10-04 14:39:41','2025-10-04 10:03:41','2025-10-04 14:39:41'),(33,242,1,'2025-10-04 11:05:04','2025-10-04 11:05:04','2025-10-04 11:05:04'),(34,157,1,'2025-10-04 11:17:51','2025-10-04 11:17:51','2025-10-04 11:17:51'),(35,77,2,'2025-10-04 12:44:10','2025-10-04 12:44:10','2025-10-04 12:44:10'),(36,74,1,'2025-10-04 12:44:11','2025-10-04 12:44:11','2025-10-04 12:44:11'),(37,49,2,'2025-10-04 15:38:35','2025-10-04 12:44:12','2025-10-04 15:38:35'),(38,161,2,'2025-10-04 15:38:36','2025-10-04 12:44:12','2025-10-04 15:38:36'),(39,159,2,'2025-10-04 15:38:39','2025-10-04 14:42:47','2025-10-04 15:38:39'),(40,119,3,'2025-10-04 19:51:25','2025-10-04 14:42:51','2025-10-04 19:51:25'),(41,260,2,'2025-10-04 15:38:41','2025-10-04 14:42:52','2025-10-04 15:38:41'),(42,261,3,'2025-10-04 19:14:49','2025-10-04 14:42:53','2025-10-04 19:14:49'),(43,263,2,'2025-10-04 15:38:42','2025-10-04 14:43:02','2025-10-04 15:38:42'),(44,264,2,'2025-10-04 15:38:42','2025-10-04 14:43:07','2025-10-04 15:38:42'),(45,265,2,'2025-10-04 15:38:43','2025-10-04 14:43:08','2025-10-04 15:38:43'),(46,285,12,'2025-10-04 19:14:30','2025-10-04 15:15:27','2025-10-04 19:14:30'),(47,163,1,'2025-10-04 15:38:27','2025-10-04 15:38:27','2025-10-04 15:38:27'),(48,50,1,'2025-10-04 15:38:36','2025-10-04 15:38:36','2025-10-04 15:38:36'),(49,156,1,'2025-10-04 15:38:37','2025-10-04 15:38:37','2025-10-04 15:38:37'),(50,155,1,'2025-10-04 15:38:38','2025-10-04 15:38:38','2025-10-04 15:38:38'),(51,139,1,'2025-10-04 15:38:38','2025-10-04 15:38:38','2025-10-04 15:38:38'),(52,138,2,'2025-10-07 19:06:34','2025-10-04 15:38:38','2025-10-07 19:06:34'),(53,111,1,'2025-10-04 15:38:39','2025-10-04 15:38:39','2025-10-04 15:38:39'),(54,78,1,'2025-10-04 19:10:59','2025-10-04 19:10:59','2025-10-04 19:10:59'),(55,38,1,'2025-10-04 19:14:29','2025-10-04 19:14:29','2025-10-04 19:14:29'),(56,200,1,'2025-10-04 19:14:38','2025-10-04 19:14:38','2025-10-04 19:14:38'),(57,83,2,'2025-10-07 15:39:53','2025-10-04 19:19:09','2025-10-07 15:39:53');
/*!40000 ALTER TABLE `button_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Test','#ff0000'),(2,'VASY','#34d8eb'),(3,'Music','#3b82f6'),(4,'Sound Effects','#10b981'),(5,'Voice','#8b5cf6'),(6,'Memes','#f59e0b'),(7,'Ambiance','#06b6d4'),(8,'Alarms','#ef4444'),(9,'Animals','#84cc16'),(10,'Nature','#14b8a6'),(11,'Gaming','#a855f7'),(12,'Comedy','#f97316'),(13,'Horror','#71717a'),(14,'Sci-Fi','#6366f1');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deleted_button`
--

DROP TABLE IF EXISTS `deleted_button`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deleted_button` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `uploaded_id` int DEFAULT NULL,
  `button_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sound_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  `sound_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'deleted',
  `delete_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_deleted_button_owner` (`owner_id`),
  KEY `idx_deleted_button_status` (`status`),
  KEY `idx_deleted_button_uploaded` (`uploaded_id`),
  CONSTRAINT `deleted_button_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deleted_button`
--

LOCK TABLES `deleted_button` WRITE;
/*!40000 ALTER TABLE `deleted_button` DISABLE KEYS */;
INSERT INTO `deleted_button` VALUES (1,1,285,'Ah','1759590925110-323800114.mp3','1759590925109-657176314.jpg',535,536,NULL,'restored','2025-10-04 19:12:30');
/*!40000 ALTER TABLE `deleted_button` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `uploaded_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_favorite` (`user_id`,`uploaded_id`),
  KEY `idx_user_favorites` (`user_id`),
  KEY `idx_uploaded_favorites` (`uploaded_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
INSERT INTO `favorite` VALUES (2,1,94,'2025-10-03 19:08:58'),(5,1,266,'2025-10-03 19:25:13'),(6,1,239,'2025-10-07 15:38:02'),(12,1,252,'2025-10-07 19:15:38'),(14,1,238,'2025-10-07 19:15:53'),(15,1,285,'2025-10-07 19:18:45');
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=537 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
INSERT INTO `file` VALUES (46,'Ca va peter.mp3','sound'),(47,'Sur 20.mp3','sound'),(48,'20-382790921.jpg','image'),(49,'jcvd_aware-1225962956.gif','image'),(45,'peter-ca-va-peter.gif','image'),(368,'hieverybodydrnick-online-audio-converter.mp3','sound'),(369,'74e.gif','image'),(50,'JCVD Aware.mp3','sound'),(54,'JCVD Un plus un.mp3','sound'),(55,'tenor-626492752.gif','image'),(53,'tenor-3142215144.gif','image'),(56,'1.mp3','sound'),(57,'tenor.gif','image'),(58,'Ouais cest pas faux.mp3','sound'),(59,'ive-come-optimus-comes-1999352028.gif','image'),(60,'Optimus Prime meme.mp3','sound'),(61,'1a439d9_1632144529067_sc-1914259225.jpeg','image'),(62,'a-few-moments-later-sponge-bob-made-with-Voicemod-technology.mp3','sound'),(63,'giphy-3194926164.gif','image'),(64,'ronaldo-siuuu-sound-effect-made-with-Voicemod-technology.mp3','sound'),(500,'l_embrouille - for sure.mp3','sound'),(499,'l_embrouille_for_sure_3.png','image'),(67,'brain-is-not-helping-96gref0zv0hy35u3-1630456662.gif','image'),(68,'Brain Not Braining.mp3','sound'),(69,'giphy-2335716040.gif','image'),(70,'Francois Hollande anglais..mp3','sound'),(71,'tenor-2002584918.gif','image'),(72,'alerte_gogole_final.mp3','sound'),(75,'homer-simpson-whoo-hoo.gif','image'),(76,'homersimpsonwoohoow-1.mp3','sound'),(77,'1ohlsh-1797127804.gif','image'),(78,'c_nul_homer.mp3','sound'),(80,'dans-ton-cul1.mp3','sound'),(92,'Sur 20.mp3','sound'),(93,'Windows 10 error.gif','image'),(87,'eastwood.png','image'),(88,'Eastwood - les avis.mp3','sound'),(89,'image_2024-05-10_161144266.png','image'),(90,'Mario Death.mp3','sound'),(91,'Sur 20.png','image'),(85,'cartman pokerface.gif','image'),(86,'cartman-poker-face.mp3','sound'),(94,'windows-10-error-soundshorter.mp3','sound'),(95,'Run.png','image'),(96,'Run.mp3','sound'),(97,'terminator.png','image'),(98,'Terminator - Ill be back.mp3','sound'),(99,'Brain not braining 2.png','image'),(100,'Brain Not Braining.mp3','sound'),(101,'Voilà jaime bie.PNG','image'),(102,'voilà jaime bien jaime bien.mp3','sound'),(103,'Borgir.gif','image'),(104,'borgir™.mp3','sound'),(105,'PHUB.jpg','image'),(106,'Pornhub intro song.mp3','sound'),(107,'discord.gif','image'),(108,'dans-ton-cul1.mp3','sound'),(109,'dans-ton-cul1.mp3','sound'),(110,'dtc.gif','image'),(111,'bird_wtf.jpg','image'),(112,'Bird wtf.mp3','sound'),(113,'Outlook.png','image'),(114,'Outlook.mp3','sound'),(115,'discord.gif','image'),(116,'Discord.mp3','sound'),(122,'JEANNE AU SECOURS !!!!! (ORIGINAL) (2).mp3','sound'),(119,'raciste.jpg','image'),(120,'OUI JE SUIS RACISTE OUI.mp3','sound'),(121,'jm.PNG','image'),(126,'Encore, Ca fait beaucoup la non! Mister V.mp3','sound'),(127,'noice_gif.gif','image'),(125,'misterV.gif','image'),(128,'Hot Food (Nice).mp3','sound'),(129,'no god please no.gif','image'),(130,'NO GOD! PLEASE NO!!! NOOOOOOOOOO (1).mp3','sound'),(131,'pasltempnieze.jfif','image'),(132,'Téquila Heineken pas l’temp de niaiser (meme).mp3','sound'),(133,'isou.gif','image'),(134,'ISOU.mp3','sound'),(135,'image_2024-10-04_140800008.png','image'),(502,'l_embrouille - rire.mp3','sound'),(136,'ah-bah-bravo-nils-super-pour-lappareil-photo-original_AacWmL13.mp3','sound'),(367,'xT5LMITLupRVmSkJva.webp','image'),(145,'K2SQW66W4ZDCRGR5RJDVMEX2QI.jpg','image'),(146,'mais-test-pas-net-baptiste_BJo99sCi.mp3','sound'),(149,'yipee.jpg','image'),(150,'Fortnite und ein Cola Yippee.mp3','sound'),(151,'MK - Fatality.png','image'),(152,'MK - Fatality.mp3','sound'),(153,'JCVD-Un plus un.png','image'),(154,'JCVD Un plus un.mp3','sound'),(155,'au_bout_de_mes_reves.png','image'),(156,'Au bout de mes reves.mp3','sound'),(157,'ah-okay.png','image'),(158,'Okay.mp3','sound'),(159,'Surprise Mothefucker.gif','image'),(160,'surprise mother fucker sound effect.mp3','sound'),(378,'whisky.mp3','sound'),(377,'whisky.gif','image'),(173,'mortal-kombat-scorpion.gif','image'),(174,'get-over-here_PjuMYS5.mp3','sound'),(175,'de-la-viande.png','image'),(376,'Mario dit non.mp3','sound'),(375,'nonmario.gif','image'),(176,'de-la-viande.mp3','sound'),(385,'duck_quack.jpg','image'),(386,'duck_quack.mp3','sound'),(183,'oh-you-touch-my-tralala.PNG','image'),(184,'oh-you-touch-my-tralala.mp3','sound'),(187,'8qYj7l.gif','image'),(188,'karadoc-legrascestlavie.mp3','sound'),(189,'snOvBnWwFswXqJ8JpG.gif','image'),(190,'quietfags.mp3','sound'),(191,'XmLb92.gif','image'),(192,'power_ZUTt5Sk.mp3','sound'),(193,'shut-up-for-a-sec.png','image'),(194,'shut-up-for-a-sec.mp3','sound'),(195,'coup_de_beche.png','image'),(196,'coup_de_beche.mp3','sound'),(197,'oh-you-touch-my-tralala.jpg','image'),(198,'oh-you-touch-my-tralala.mp3','sound'),(328,'on_sen_bat_les_couilles.mp3','sound'),(327,'on_sen_bat_les_couilles.png','image'),(325,'woaw.png','image'),(329,'Lk1HlQ.gif','image'),(201,'le_gras_cest_la_vie.jpg','image'),(202,'le_gras_cest_la_vie.mp3','sound'),(203,'just_un_doigt.jpg','image'),(204,'juste_un_doigt.mp3','sound'),(205,'respect_my_authority_2.jpg','image'),(206,'respect_my_authority.mp3','sound'),(209,'JCVD-Jadore leau.png','image'),(210,'JCVD Jadore leau.mp3','sound'),(211,'pas_content.png','image'),(212,'pas_content.mp3','sound'),(213,'optimus_prime.png','image'),(214,'Optimus Prime meme.mp3','sound'),(215,'urgetokill_rising.png','image'),(216,'urgetokill_rising.mp3','sound'),(219,'pegi_18.png','image'),(220,'pegi_18.mp3','sound'),(221,'homer-i-dont-know.png','image'),(222,'homer-i-dont-know.mp3','sound'),(223,'pron_hub.png','image'),(224,'pron_hub.mp3','sound'),(225,'discord.jpg','image'),(226,'discord.mp3','sound'),(227,'gary-bateria.gif','image'),(228,'Bob-ba-dum-tss.mp3','sound'),(229,'kaamelott-venec.gif','image'),(230,'Kaamelott-Les noix.mp3','sound'),(233,'tumblr_lwqafrqASi1r4gei2o1_400.gif','image'),(234,'SP-Combat infirme.mp3','sound'),(235,'south-park-eric-cartman.gif','image'),(236,'SP-Cartman maison.mp3','sound'),(237,'300-leonidas.gif','image'),(238,'This is Sparta.mp3','sound'),(239,'Kaamelott-On en a gros.png','image'),(240,'Kaamelott-On en a gros.mp3','sound'),(241,'homer-simpson-sus.gif','image'),(501,'l_embrouille_rire_3.png','image'),(242,'Simpson-dun-dun-dun-duhhh.mp3','sound'),(243,'Kaamelott-Pas mort.png','image'),(244,'Kaamelott-Pas mort.mp3','sound'),(245,'fbi-fbiopenup.gif','image'),(246,'FBI.mp3','sound'),(247,'f2a51008-6c34-4243-b1ad-bb0bcc469af0_text.gif','image'),(248,'SP-Mormonen.mp3','sound'),(249,'holy.gif','image'),(250,'SP-Putain de merde mvoyez.mp3','sound'),(251,'homer-simpson-doh.gif','image'),(252,'Simpson-d ho.mp3','sound'),(253,'Bob-2HLater.png','image'),(254,'Bob-2HLater.mp3','sound'),(255,'Bob-2kLater.png','image'),(256,'Bob-2kLater.mp3','sound'),(257,'one-eternity-later-icjwa77nxzmxchum.gif','image'),(469,'6b253808b8000ffb8434e108f502665e.gif','image'),(258,'Bob-One eternity later.mp3','sound'),(261,'Kaamelott-Chagrin.png','image'),(262,'Kaamelott-Chagrin.mp3','sound'),(263,'kaamelott - merlin cv.gif','image'),(264,'Kaamelott-Cv Merlin.mp3','sound'),(265,'tumblr_mrs5x2zFm61sg0iqvo1_500.webp','image'),(266,'Les Nuls-J ai fain.mp3','sound'),(391,'dolphin.png','image'),(389,'wow.jpg','image'),(390,'wow.mp3','sound'),(269,'345fae84-74eb-48eb-8a12-2e206f0746e6_text.gif','image'),(270,'cartman-motherfucker.mp3','sound'),(271,'encore du travail.png','image'),(272,'encore du travail.mp3','sound'),(273,'simpsons-hahah.gif','image'),(274,'Simpson-HaHa.mp3','sound'),(275,'60b07f0a-8c40-44a2-9563-749ab20e8163_text.gif','image'),(276,'SP-Dumb.mp3','sound'),(277,'hahahahahaha-eric-cartman.gif','image'),(278,'SP-Cartman rire.mp3','sound'),(279,'Travail terminé.png','image'),(280,'Travail terminé.mp3','sound'),(281,'m3a8VU.gif','image'),(282,'JDG-C est la fete.mp3','sound'),(283,'JDG-Dans les bois.png','image'),(284,'JDG-Dans les bois.mp3','sound'),(285,'BU2ujv.gif','image'),(286,'JDG-drogue.mp3','sound'),(287,'respect-my-authority-cartman.gif','image'),(288,'SP-Cartman autorite.mp3','sound'),(439,'cest de toute beauté.webp','image'),(291,'tumblr_oodndhqEYp1txu1kho1_540.gif','image'),(292,'futurama-toi-ta-gueule_CadxEZz.mp3','sound'),(293,'futurama-bender.gif','image'),(294,'goldenbender.mp3','sound'),(295,'a700bfa31bc6c27a7bab878055436e68.gif','image'),(296,'bender.mp3','sound'),(297,'tumblr_e863abd4138022086ff414269a25a526_33c69ebb_500.gif','image'),(298,'karadoc-cestdelamerde.mp3','sound'),(299,'Kaamelott- c est de la merde.gif','image'),(300,'karadoc-cestdelamerde.mp3','sound'),(301,'y56x0z.gif','image'),(302,'zoidberg-woop.mp3','sound'),(303,'tumblr_5bbf54de15cb1a66be93428773bc9ef1_23497e68_500.webp','image'),(304,'Asterix-Pas content.mp3','sound'),(305,'quest-ce-a-dire-que-ceci.gif','image'),(306,'Kaamelott-Ceci 2.mp3','sound'),(307,'mais-c-etait-sur-enfaite-sardoche-rage.gif','image'),(308,'sardoche-cetait-sur.mp3','sound'),(392,'dolphin.mp3','sound'),(393,'mario_kart.png','image'),(394,'mario_kart.mp3','sound'),(395,'dog_toy.png','image'),(379,'Finish her.png','image'),(380,'finish-her.mp3','sound'),(311,'respect_my_authority.jpg','image'),(312,'respect_my_authority.mp3','sound'),(313,'flemme.jpg','image'),(314,'flemme.mp3','sound'),(326,'woaw.mp3','sound'),(319,'Cest qui le patron.jpg','image'),(320,'C’est qui le patron ! C’est moi.mp3','sound'),(321,'this_is_sparta.png','image'),(322,'this_is_sparta.mp3','sound'),(330,'jsuis-content-je-vomis.mp3','sound'),(348,'Metal Gear Solid Alert - Sound Effect (HD).mp3','sound'),(349,'giphy.gif','image'),(343,'cafard-souffrir.gif','image'),(344,'cafard-souffrir.mp3','sound'),(347,'b8d739d1f05480904aafd97c3050edc5.gif','image'),(346,'mais-oui-cest-clair-by-eddy-malou.mp3','sound'),(345,'eddy-malou-ouiça-fait-allusion.gif','image'),(350,'denis-brogniart-ah-original_Wa0LP6o.mp3','sound'),(351,'tumblr_ngyhy2oAhv1s6uvfyo1_r1_500.gif','image'),(352,'lost-woods-the-legend-of-zelda-ocarina-of-time.mp3','sound'),(353,'swordWinChest.gif','image'),(354,'zelda-gif-sesi.mp3','sound'),(355,'6e808b190efe17ee20ab1f1881253102.gif','image'),(356,'zelda-item.mp3','sound'),(357,'7d71a22c49707a4.gif','image'),(358,'Y2Mate.is - Super Mario (Ok Bye Bye)-g2W7yhj1vfs-128k-1654911012852.mp3','sound'),(359,'this-is-fun-tracey-matney.gif','image'),(360,'this_is_fun.mp3','sound'),(361,'gravity-falls-duck.gif','image'),(362,'duck-button.mp3','sound'),(396,'dog_toy_2.mp3','sound'),(397,'cartoon_bad_joke.png','image'),(398,'cartoon_bad_joke.mp3','sound'),(399,'suspense.png','image'),(400,'suspense.mp3','sound'),(401,'horn.png','image'),(402,'horn.mp3','sound'),(403,'drum_roll.png','image'),(404,'drum_roll.mp3','sound'),(405,'wrong.png','image'),(370,'hey-listen-zelda.mp3','sound'),(406,'wrong.mp3','sound'),(407,'applaus.png','image'),(408,'applaus.mp3','sound'),(409,'xfiles.png','image'),(410,'xfiles.mp3','sound'),(411,'evil_morty.png','image'),(412,'evil_morty.mp3','sound'),(413,'fail_titanic_2.png','image'),(435,'bien_se_passer.jpg','image'),(414,'fail_titanic.mp3','sound'),(415,'final_credit.png','image'),(416,'final_credit.mp3','sound'),(417,'dumb.png','image'),(418,'dumb.mp3','sound'),(419,'hein.png','image'),(420,'hein.mp3','sound'),(421,'mortal-kombat.gif','image'),(422,'flawless-victory_YNGr54X.mp3','sound'),(423,'tumblr_1bbfe35c375b211cb33d3a3485ae91f4_7033a59b_640.gif','image'),(424,'outstanding_unLituT.mp3','sound'),(425,'Finish him.png','image'),(426,'finish-him-mk3.mp3','sound'),(427,'mais_oui_c_est_clair.png','image'),(428,'mais_oui_c_est_clair.mp3','sound'),(433,'outlook_notification.png','image'),(434,'outlook_notification.mp3','sound'),(431,'caca_sur_toi_3.png','image'),(432,'caca_sur_toi.mp3','sound'),(436,'bien_se_passer.mp3','sound'),(437,'mario_non.png','image'),(438,'mario_non.mp3','sound'),(441,'cest_de_toute_beaute.png','image'),(442,'cest_de_toute_beaute.mp3','sound'),(443,'ingenieur_informaticien.png','image'),(444,'ingenieur_informaticien.mp3','sound'),(445,'lalcool-cest-pas-cool-pas-cool.gif','image'),(446,'Lalcool cest pas cool.wav','sound'),(477,'mcdonalds.png','image'),(449,'image_2024-10-01_163538984.png','image'),(450,'Patrice  oh le con ! (Le flambeau) #flambeau #patricefambeau.mp3','sound'),(476,'baby_shark.mp3','sound'),(455,'deadpool_its_over.png','image'),(456,'deadpool_its_over.mp3','sound'),(457,'fous_ta_cagoule.png','image'),(458,'fous_ta_cagoule.mp3','sound'),(470,'flemme.mp3','sound'),(475,'baby_shark.png','image'),(473,'breaking_bad.png','image'),(474,'breaking_bad.mp3','sound'),(478,'mcdonalds.mp3','sound'),(479,'motus_boule_noire.jpg','image'),(480,'motus_boule_noire.mp3','sound'),(481,'ouille_ouille_ouille.jpg','image'),(482,'ouille_ouille_ouille.mp3','sound'),(483,'alerte.gif','image'),(484,'alerte.mp3','sound'),(485,'il va se facher.jpg','image'),(486,'il va se facher.mp3','sound'),(487,'connasse va.jfif','image'),(488,'Connasse va.mp3','sound'),(489,'on ta jamais apris a manger.jfif','image'),(490,'on ta jamais apris a manger des chips.mp3','sound'),(491,'Tu trouve ça vulgaire.jpg','image'),(492,'Dikkenek - Vulgaire!.mp3','sound'),(493,'Education.png','image'),(494,'education minimum.mp3','sound'),(495,'Achete la.gif','image'),(496,'achete la.mp3','sound'),(497,'viens.jfif','image'),(498,'Ben viens.mp3','sound'),(503,'sylvain le militant.jpg','image'),(504,'sylvain le militant.mp3','sound'),(505,'giphy.webp','image'),(506,'Sleeping meme sound.mp3','sound'),(507,'purée de pommes de terre.jfif','image'),(508,'Oh purée de pomme de terre - #meme.mp3','sound'),(509,'bestBtn.jpg','image'),(510,'never-gonna-give-you-up_we6zzBU.mp3','sound'),(531,'test_9de7acec2ab74a2f951564720f5a3789.png','image'),(532,'test_1357ee9cca064ee7b0520608b817fbc4.mp3','sound'),(533,'discord.gif','image'),(534,'Discord.mp3','sound'),(535,'1759590925109-657176314.jpg','image'),(536,'1759590925110-323800114.mp3','sound');
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `linked`
--

DROP TABLE IF EXISTS `linked`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `linked` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `uploaded_id` int NOT NULL,
  `tri` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=622 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `linked`
--

LOCK TABLES `linked` WRITE;
/*!40000 ALTER TABLE `linked` DISABLE KEYS */;
INSERT INTO `linked` VALUES (4,1,38,30),(5,1,39,32),(6,1,40,33),(156,1,104,1),(8,1,42,35),(9,1,43,36),(10,1,44,37),(11,1,45,38),(12,1,46,43),(619,1,145,2),(14,1,48,44),(15,1,49,49),(16,1,50,47),(39,1,52,45),(40,1,53,46),(41,1,72,29),(43,1,74,50),(44,1,75,31),(45,1,76,16),(46,1,77,51),(47,1,78,52),(48,1,79,22),(49,1,80,19),(50,1,81,18),(149,2,102,11),(52,5,84,0),(53,5,81,18),(54,5,80,1),(55,5,44,2),(56,2,37,31),(57,5,38,3),(100,5,74,10),(59,2,38,24),(92,2,83,7),(61,2,40,1),(63,5,75,4),(64,2,43,28),(65,5,52,5),(66,1,84,17),(67,5,50,6),(68,2,45,20),(216,3,130,71),(254,2,161,31),(143,5,98,16),(451,1,237,96),(73,2,77,0),(74,2,76,10),(75,2,75,18),(76,2,74,16),(77,2,73,12),(78,2,53,30),(79,2,52,29),(220,2,134,5),(81,2,50,22),(82,5,49,7),(83,2,49,3),(84,5,37,8),(85,2,79,13),(86,2,80,25),(96,5,85,11),(223,2,137,8),(89,5,51,9),(90,5,82,8),(91,2,84,34),(93,5,83,9),(443,3,235,93),(224,3,138,60),(97,1,85,14),(99,5,86,12),(101,7,40,74),(102,7,38,75),(103,7,42,76),(104,7,43,77),(105,7,45,78),(106,7,47,79),(107,7,51,80),(108,7,52,81),(109,7,53,82),(110,7,74,83),(111,7,76,84),(112,7,77,85),(113,7,80,86),(114,7,82,87),(115,7,83,88),(116,7,84,89),(117,7,85,90),(118,7,86,91),(121,2,88,14),(122,5,88,13),(123,1,88,11),(124,1,83,53),(319,1,136,58),(127,1,89,23),(128,1,90,94),(129,1,91,10),(130,1,92,12),(131,1,93,4),(132,2,91,27),(141,2,95,15),(134,1,94,9),(603,11,81,4),(136,7,96,106),(137,1,96,75),(139,7,97,108),(140,7,95,109),(142,2,93,26),(144,5,97,14),(145,5,99,15),(146,2,99,33),(147,2,100,17),(148,2,101,2),(150,2,103,23),(151,1,103,54),(152,1,100,55),(153,1,97,56),(154,1,101,34),(162,3,42,48),(160,2,108,25),(163,3,50,0),(164,3,45,56),(165,3,72,5),(166,3,53,25),(167,3,52,24),(168,3,74,53),(169,3,100,22),(170,3,103,99),(171,3,102,134),(172,3,104,84),(173,3,93,51),(174,3,91,135),(366,1,198,72),(176,3,83,92),(333,3,79,95),(178,3,84,85),(179,3,49,102),(180,3,37,51),(258,2,151,19),(523,2,254,75),(183,3,78,62),(384,2,214,53),(185,3,111,17),(186,3,112,34),(190,3,116,46),(272,5,169,19),(256,2,153,21),(261,2,142,43),(192,3,118,35),(193,3,43,36),(253,2,164,39),(195,3,77,122),(284,2,180,44),(215,2,131,4),(255,2,160,38),(207,2,125,37),(208,2,126,36),(201,3,119,8),(202,3,120,63),(203,3,121,26),(204,3,122,37),(205,2,123,35),(211,3,101,66),(212,3,40,64),(213,3,129,65),(214,2,130,35),(217,3,131,104),(218,3,132,28),(221,3,135,27),(222,2,136,6),(225,3,139,38),(292,1,178,44),(227,3,141,1),(228,3,142,9),(229,3,143,67),(230,3,144,39),(231,3,145,31),(232,3,146,40),(233,3,147,123),(234,3,148,4),(235,3,149,10),(236,3,150,23),(237,3,151,57),(238,3,152,58),(239,3,153,59),(281,3,177,91),(241,3,155,42),(242,3,156,43),(243,3,157,76),(244,3,81,124),(245,3,80,112),(259,2,147,40),(247,3,159,7),(248,3,160,73),(249,3,161,29),(250,3,162,3),(251,3,163,2),(252,3,164,74),(585,5,269,467),(263,2,138,47),(264,3,73,86),(265,3,165,47),(266,3,166,49),(267,3,167,50),(268,3,99,87),(365,1,200,20),(270,3,92,88),(271,3,168,6),(273,3,170,11),(274,3,171,12),(275,3,172,13),(276,3,173,44),(277,3,174,14),(278,3,175,83),(280,3,176,41),(282,3,178,81),(283,2,179,41),(291,2,184,45),(289,3,183,101),(288,5,183,16),(445,1,233,8),(293,1,177,57),(294,1,174,60),(295,1,183,59),(296,1,170,61),(297,1,134,62),(298,1,125,28),(299,1,126,63),(300,1,129,64),(301,5,177,17),(302,5,170,21),(303,5,173,22),(304,5,174,24),(305,5,157,25),(306,5,125,19),(307,5,103,26),(308,5,130,30),(309,5,141,27),(310,5,163,28),(311,5,180,29),(312,5,95,20),(313,1,160,42),(315,1,149,65),(524,2,255,76),(317,1,123,66),(320,1,127,68),(321,1,163,69),(322,5,185,110),(518,5,160,43),(324,3,186,15),(325,1,186,24),(326,5,186,38),(327,1,173,70),(328,1,157,71),(329,2,187,46),(330,1,187,13),(331,3,187,94),(338,3,191,97),(334,3,136,96),(335,3,188,77),(339,3,192,98),(340,3,193,72),(341,3,194,100),(342,3,195,69),(343,3,196,70),(494,3,197,71),(621,1,285,0),(446,1,235,93),(347,1,193,7),(348,1,195,27),(349,1,196,26),(350,2,193,48),(351,3,198,54),(352,3,199,105),(353,3,200,106),(357,1,161,48),(358,3,169,53),(360,2,199,49),(361,3,128,82),(362,2,128,32),(363,3,203,30),(364,3,204,68),(367,1,199,73),(368,1,153,39),(369,1,152,40),(370,1,151,41),(371,1,204,74),(576,1,238,125),(377,3,208,75),(378,3,180,90),(379,3,209,20),(382,2,212,50),(385,2,215,51),(386,2,216,52),(387,2,217,55),(388,2,218,54),(389,2,219,56),(390,1,208,76),(391,1,209,77),(392,1,212,21),(393,3,212,107),(394,1,214,25),(395,1,215,80),(396,1,216,81),(397,1,217,97),(398,3,214,16),(399,1,218,82),(400,1,219,83),(401,3,215,103),(402,3,216,55),(403,3,217,108),(404,3,218,79),(405,3,219,32),(406,2,220,57),(407,2,221,59),(408,2,222,58),(409,2,223,60),(410,2,224,61),(411,2,225,62),(412,2,226,63),(413,2,227,64),(414,2,228,65),(415,2,229,66),(416,1,220,84),(417,1,221,85),(418,1,222,86),(419,1,223,87),(420,1,224,88),(421,1,225,89),(422,1,226,90),(423,1,227,91),(424,1,228,92),(425,1,229,79),(426,3,220,109),(427,3,221,61),(428,3,222,81),(429,3,223,78),(430,3,224,110),(431,3,225,33),(432,3,226,111),(433,3,227,113),(434,3,228,80),(435,3,229,114),(436,3,230,21),(437,3,231,18),(438,3,232,19),(439,2,233,67),(442,2,236,9),(441,2,235,68),(444,3,236,128),(447,1,232,78),(448,1,141,94),(449,1,142,95),(450,2,237,70),(581,3,269,138),(453,5,217,30),(521,2,238,69),(455,5,200,31),(458,3,237,115),(459,11,38,3),(602,11,39,2),(461,11,217,0),(462,7,217,367),(463,6,217,0),(464,7,212,369),(466,6,207,1),(467,7,238,371),(468,6,43,2),(469,6,236,3),(470,7,200,374),(471,6,212,4),(472,7,44,376),(473,7,236,377),(474,1,239,5),(478,2,241,72),(476,5,239,32),(477,2,240,71),(479,1,242,99),(480,1,241,98),(483,2,245,73),(484,2,246,74),(495,3,246,116),(486,3,245,117),(487,3,244,119),(488,3,242,120),(489,3,241,121),(490,1,246,101),(491,1,244,100),(492,1,245,102),(493,3,239,118),(496,11,212,1),(502,3,88,125),(503,3,89,126),(504,3,86,127),(506,1,143,67),(508,5,242,33),(509,5,241,34),(510,5,240,35),(511,5,244,36),(512,5,245,37),(513,5,212,39),(514,5,226,40),(515,5,227,41),(516,5,122,23),(517,5,164,42),(519,3,252,89),(520,1,252,6),(525,2,256,77),(526,2,257,78),(527,2,258,79),(528,1,254,103),(529,1,255,104),(530,1,256,105),(531,1,257,106),(532,1,258,107),(533,3,254,129),(534,3,255,130),(535,3,256,131),(536,3,257,132),(537,3,258,133),(538,1,175,109),(539,1,156,110),(540,1,155,111),(541,1,139,112),(542,1,138,113),(615,1,284,15),(544,1,159,114),(545,1,111,115),(546,1,112,116),(547,1,119,117),(548,1,120,108),(549,3,259,45),(550,5,246,44),(551,5,238,45),(552,5,237,46),(553,5,233,47),(554,5,218,54),(555,5,221,49),(556,5,229,50),(557,5,228,55),(558,5,191,48),(559,5,194,51),(560,5,223,53),(561,5,222,52),(563,5,196,56),(564,1,260,118),(565,5,260,451),(566,1,261,119),(567,1,262,120),(568,1,263,121),(569,1,264,122),(570,1,265,123),(571,1,266,124),(572,2,267,80),(573,2,268,81),(618,1,267,3),(575,1,268,126),(577,3,267,136),(578,3,268,137),(579,1,269,127),(580,3,238,52),(584,5,268,466),(583,2,163,42),(586,5,265,468),(587,5,266,469),(588,5,255,470),(589,5,267,471),(590,5,270,472),(591,3,270,139),(592,5,232,474),(593,5,100,475),(594,5,187,476),(596,1,270,128),(597,5,271,478),(598,3,271,140),(599,1,271,129),(600,3,272,141),(601,1,272,130);
/*!40000 ALTER TABLE `linked` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploaded`
--

DROP TABLE IF EXISTS `uploaded`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploaded` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `sound_id` int NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `button_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload date/time of the button',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=286 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploaded`
--

LOCK TABLES `uploaded` WRITE;
/*!40000 ALTER TABLE `uploaded` DISABLE KEYS */;
INSERT INTO `uploaded` VALUES (38,45,46,1,'','1','2025-10-07 19:52:45'),(39,48,47,2,'','1','2025-10-07 19:52:45'),(40,49,50,2,'','1','2025-10-07 19:52:45'),(41,53,54,2,'','1','2025-10-07 19:52:45'),(42,55,56,3,'','1','2025-10-07 19:52:45'),(43,57,58,3,'','1','2025-10-07 19:52:45'),(44,59,60,1,'','1','2025-10-07 19:52:45'),(45,61,62,1,'','1','2025-10-07 19:52:45'),(46,63,64,1,'','1','2025-10-07 19:52:45'),(48,67,68,1,'','1','2025-10-07 19:52:45'),(49,69,70,1,'','1','2025-10-07 19:52:45'),(50,71,72,1,'','1','2025-10-07 19:52:45'),(52,75,76,1,'','1','2025-10-07 19:52:45'),(53,77,78,1,'','1','2025-10-07 19:52:45'),(72,85,86,1,'','1','2025-10-07 19:52:45'),(73,87,88,2,'','1','2025-10-07 19:52:45'),(74,89,90,2,'','1','2025-10-07 19:52:45'),(75,91,92,2,'','1','2025-10-07 19:52:45'),(76,93,94,1,'','1','2025-10-07 19:52:45'),(77,95,96,2,'','1','2025-10-07 19:52:45'),(78,97,98,2,'','1','2025-10-07 19:52:45'),(79,99,100,2,'','1','2025-10-07 19:52:45'),(80,101,102,5,'','1','2025-10-07 19:52:45'),(81,103,104,5,'','1','2025-10-07 19:52:45'),(82,105,106,6,'','1','2025-10-07 19:52:45'),(83,110,109,1,'','1','2025-10-07 19:52:45'),(84,111,112,5,'bird_wtf.jpg','1','2025-10-07 19:52:45'),(85,113,114,1,'Outlook.png','1','2025-10-07 19:52:45'),(86,115,116,1,'discord.gif','1','2025-10-07 19:52:45'),(88,119,120,2,'raciste.jpg','1','2025-10-07 19:52:45'),(89,121,122,6,'jm.PNG','1','2025-10-07 19:52:45'),(91,125,126,1,'misterV.gif','1','2025-10-07 19:52:45'),(92,127,128,1,'noice_gif.gif','1','2025-10-07 19:52:45'),(93,129,130,1,'no god please no.gif','1','2025-10-07 19:52:45'),(94,131,132,1,'pasltempnieze.jfif','1','2025-10-07 19:52:45'),(95,133,134,1,'isou.gif','1','2025-10-07 19:52:45'),(96,135,136,5,'Logo_justitie_0.png','1','2025-10-07 19:52:45'),(97,145,146,5,'K2SQW66W4ZDCRGR5RJDVMEX2QI.jpg','1','2025-10-07 19:52:45'),(99,149,150,5,'yipee.jpg','1','2025-10-07 19:52:45'),(100,151,152,2,'MK - Fatality.png','1','2025-10-07 19:52:45'),(101,153,154,2,'JCVD-Un plus un.png','1','2025-10-07 19:52:45'),(102,155,156,2,'Au bout de mes reves.png','1','2025-10-07 19:52:45'),(103,157,158,2,'ah-okay.png','1','2025-10-07 19:52:45'),(104,159,160,1,'Surprise Mothefucker.gif','1','2025-10-07 19:52:45'),(256,477,478,2,'mcdonalds','1','2025-10-07 19:52:45'),(208,377,378,3,'whisky.gif','1','2025-10-07 19:52:45'),(111,173,174,3,'get over here.png','1','2025-10-07 19:52:45'),(112,175,176,3,'de-la-viande.png','1','2025-10-07 19:52:45'),(252,469,470,3,'j_ai pas envie','1','2025-10-07 19:52:45'),(215,391,392,2,'dolphin.png','1','2025-10-07 19:52:45'),(116,183,184,3,'oh-you-touch-my-tralala.PNG','1','2025-10-07 19:52:45'),(254,473,474,2,'breaking bad','1','2025-10-07 19:52:45'),(118,187,188,3,'8qYj7l.gif','1','2025-10-07 19:52:45'),(119,189,190,3,'quietfags.png','1','2025-10-07 19:52:45'),(120,191,192,3,'power.png','1','2025-10-07 19:52:45'),(121,193,194,3,'shut-up-for-a-sec.png','1','2025-10-07 19:52:45'),(122,195,196,3,'coup_de_beche.png','1','2025-10-07 19:52:45'),(123,197,198,2,'oh-you-touch-my-tralala.jpg','1','2025-10-07 19:52:45'),(187,327,328,2,'on_sen_bat_les_couilles.png','1','2025-10-07 19:52:45'),(125,201,202,2,'le_gras_cest_la_vie.jpg','1','2025-10-07 19:52:45'),(126,203,204,2,'just_un_doigt.jpg','1','2025-10-07 19:52:45'),(127,205,206,2,'respect_my_authority_2.jpg','1','2025-10-07 19:52:45'),(128,211,212,2,'pas_content.png','1','2025-10-07 19:52:45'),(129,209,210,2,'JCVD-Jadore leau.png','1','2025-10-07 19:52:45'),(131,213,214,2,'optimus_prime.png','1','2025-10-07 19:52:45'),(132,215,216,3,'urgetokill_rising.png','1','2025-10-07 19:52:45'),(186,325,326,5,'woaw.png','1','2025-10-07 19:52:45'),(134,219,220,2,'pegi_18.png','1','2025-10-07 19:52:45'),(135,221,222,3,'homer-i-dont-know.png','1','2025-10-07 19:52:45'),(136,223,224,2,'pron_hub.png','1','2025-10-07 19:52:45'),(137,225,226,2,'discord.jpg','1','2025-10-07 19:52:45'),(138,227,228,3,'Bob-ba-dum-tss.png','1','2025-10-07 19:52:45'),(139,229,230,3,'Kaamelott-Les noix.png','1','2025-10-07 19:52:45'),(257,479,480,2,'motus boule noire','1','2025-10-07 19:52:45'),(141,233,234,3,'SP-Combat infirme.png','1','2025-10-07 19:52:45'),(142,235,236,3,'SP-Cartman maison.png','1','2025-10-07 19:52:45'),(143,237,238,3,'This is Sparta.png','1','2025-10-07 19:52:45'),(144,239,240,3,'Kaamelott-On en a gros.png','1','2025-10-07 19:52:45'),(145,241,242,3,'Simpson-dun-dun-dun-duhhh.png','1','2025-10-07 19:52:45'),(146,243,244,3,'Kaamelott-Pas mort.png','1','2025-10-07 19:52:45'),(147,245,246,3,'FBI.png','1','2025-10-07 19:52:45'),(148,247,248,3,'SP-Mormonen.png','1','2025-10-07 19:52:45'),(149,249,250,3,'SP-Putain de merde mvoyez.png','1','2025-10-07 19:52:45'),(150,251,252,3,'Simpson-d ho.png','1','2025-10-07 19:52:45'),(151,253,254,3,'Bob-2HLater.png','1','2025-10-07 19:52:45'),(152,255,256,3,'Bob-2kLater.png','1','2025-10-07 19:52:45'),(153,257,258,3,'Bob-One eternity later.png','1','2025-10-07 19:52:45'),(259,483,484,3,'Alerte','1','2025-10-07 19:52:45'),(155,261,262,3,'Kaamelott-Chagrin.png','1','2025-10-07 19:52:45'),(156,263,264,3,'Kaamelott-Cv Merlin.png','1','2025-10-07 19:52:45'),(157,265,266,3,'Les Nuls-J ai fain.png','1','2025-10-07 19:52:45'),(214,389,390,2,'wow.jpg','1','2025-10-07 19:52:45'),(159,269,270,3,'cartman-motherfucker.png','1','2025-10-07 19:52:45'),(160,271,272,3,'encore du travail.png','1','2025-10-07 19:52:45'),(161,273,274,3,'Simpson-HaHa.png','1','2025-10-07 19:52:45'),(162,275,276,3,'SP-Dumb.png','1','2025-10-07 19:52:45'),(163,277,278,3,'SP-Cartman rire.png','1','2025-10-07 19:52:45'),(164,279,280,3,'Travail terminé.png','1','2025-10-07 19:52:45'),(165,281,282,3,'JDG-C est la fete.png','1','2025-10-07 19:52:45'),(166,283,284,3,'JDG-Dans les bois.png','1','2025-10-07 19:52:45'),(167,285,286,3,'JDG-drogue.png','1','2025-10-07 19:52:45'),(168,287,288,3,'SP-Cartman autorite.png','1','2025-10-07 19:52:45'),(170,291,292,3,'Futurama-Toi ta gueule.PNG','1','2025-10-07 19:52:45'),(171,293,294,3,'artworks-000110028019-z9b4oq-t500x500.jpg','1','2025-10-07 19:52:45'),(172,295,296,3,'Bender-bite.png','1','2025-10-07 19:52:45'),(173,299,300,3,'Kaamelott- c est de la merde.gif','1','2025-10-07 19:52:45'),(174,301,302,3,'y56x0z.gif','1','2025-10-07 19:52:45'),(175,303,304,3,'Asterix-Pas content.png','1','2025-10-07 19:52:45'),(176,305,306,3,'Kaamelott-Ceci.png','1','2025-10-07 19:52:45'),(177,307,308,5,'mais-c-etait-sur-enfaite-sardoche-rage.gif','1','2025-10-07 19:52:45'),(179,311,312,2,'respect_my_authority.jpg','1','2025-10-07 19:52:45'),(180,313,314,2,'flemme.jpg','1','2025-10-07 19:52:45'),(188,329,330,3,'Lk1HlQ.gif','1','2025-10-07 19:52:45'),(183,319,320,5,'Cest qui le patron.jpg','1','2025-10-07 19:52:45'),(184,321,322,2,'this_is_sparta.png','1','2025-10-07 19:52:45'),(191,343,344,3,'cafard-souffrir.gif','1','2025-10-07 19:52:45'),(192,345,346,3,'eddy-malou-ouiça-fait-allusion.gif','1','2025-10-07 19:52:45'),(193,347,348,3,'b8d739d1f05480904aafd97c3050edc5.gif','1','2025-10-07 19:52:45'),(194,349,350,3,'ah_full.gif','1','2025-10-07 19:52:45'),(195,351,352,3,'tumblr_ngyhy2oAhv1s6uvfyo1_r1_500.gif','1','2025-10-07 19:52:45'),(196,353,354,3,'swordWinChest.gif','1','2025-10-07 19:52:45'),(197,355,356,3,'6e808b190efe17ee20ab1f1881253102.gif','1','2025-10-07 19:52:45'),(198,357,358,3,'7d71a22c49707a4.gif','1','2025-10-07 19:52:45'),(199,359,360,3,'this-is-fun-tracey-matney.gif','1','2025-10-07 19:52:45'),(200,361,362,3,'gravity-falls-duck.gif','1','2025-10-07 19:52:45'),(203,367,368,3,'xT5LMITLupRVmSkJva.webp','1','2025-10-07 19:52:45'),(204,369,370,3,'74e.gif','1','2025-10-07 19:52:45'),(207,375,376,1,'nonmario.gif','1','2025-10-07 19:52:45'),(209,379,380,3,'Finish her.png','1','2025-10-07 19:52:45'),(212,385,386,2,'duck_quack.jpg','1','2025-10-07 19:52:45'),(216,393,394,2,'mario_kart.png','1','2025-10-07 19:52:45'),(217,395,396,2,'dog_toy.png','1','2025-10-07 19:52:45'),(218,397,398,2,'cartoon_bad_joke.png','1','2025-10-07 19:52:45'),(219,399,400,2,'suspense.png','1','2025-10-07 19:52:45'),(220,401,402,2,'horn.png','1','2025-10-07 19:52:45'),(221,403,404,2,'drum_roll.png','1','2025-10-07 19:52:45'),(222,405,406,2,'wrong.png','1','2025-10-07 19:52:45'),(223,407,408,2,'applaus.png','1','2025-10-07 19:52:45'),(224,409,410,2,'xfiles.png','1','2025-10-07 19:52:45'),(225,411,412,2,'evil_morty.png','1','2025-10-07 19:52:45'),(226,413,414,2,'fail_titanic.png','1','2025-10-07 19:52:45'),(227,415,416,2,'final_credit.png','1','2025-10-07 19:52:45'),(228,417,418,2,'dumb.png','1','2025-10-07 19:52:45'),(229,419,420,2,'hein.png','1','2025-10-07 19:52:45'),(230,421,422,3,'mk-flawless-victory-t-shirt-artwork-438x438.png','1','2025-10-07 19:52:45'),(231,423,424,3,'mk3 - outstanding.png','1','2025-10-07 19:52:45'),(232,425,426,3,'Finish him.png','1','2025-10-07 19:52:45'),(233,427,428,2,'mais_oui_c_est_clair.png','1','2025-10-07 19:52:45'),(236,433,434,2,'outlook_notification.png','1','2025-10-07 19:52:45'),(235,431,432,2,'caca_sur_toi_3.png','1','2025-10-07 19:52:45'),(237,435,436,2,'bien_se_passer.jpg','1','2025-10-07 19:52:45'),(238,437,438,2,'mario_non.png','1','2025-10-07 19:52:45'),(239,439,442,1,'cest de toute beauté.webp','1','2025-10-07 19:52:45'),(240,441,442,2,'cest_de_toute_beaute.png','1','2025-10-07 19:52:45'),(241,443,444,2,'ingenieur_informaticien.png','1','2025-10-07 19:52:45'),(242,445,446,1,'L\'alcool c\'est pas cool','1','2025-10-07 19:52:45'),(255,475,476,2,'baby shark','1','2025-10-07 19:52:45'),(244,449,450,5,'image_2024-10-01_163538984.png','1','2025-10-07 19:52:45'),(245,455,456,2,'deadpool_its_over.png','1','2025-10-07 19:52:45'),(246,457,458,2,'fous_ta_cagoule.png','1','2025-10-07 19:52:45'),(258,481,482,2,'ouille ouille ouille','1','2025-10-07 19:52:45'),(260,485,486,1,'Laissez le tranquille il va se facher','1','2025-10-07 19:52:45'),(261,487,488,1,'Connasse va','1','2025-10-07 19:52:45'),(262,489,490,1,'Manger des chips','1','2025-10-07 19:52:45'),(263,491,492,1,'Vulgaire','1','2025-10-07 19:52:45'),(264,493,494,1,'Education','1','2025-10-07 19:52:45'),(265,495,496,1,'Achete la','1','2025-10-07 19:52:45'),(266,497,498,1,'Ben viens','1','2025-10-07 19:52:45'),(267,499,500,2,'for sure','1','2025-10-07 19:52:45'),(268,501,502,2,'hinhinhinhin','1','2025-10-07 19:52:45'),(269,503,504,1,'Sylvain le militant','1','2025-10-07 19:52:45'),(270,505,506,5,'Boring Sleeping','1','2025-10-07 19:52:45'),(271,507,508,5,'Oh purée','1','2025-10-07 19:52:45'),(272,509,510,3,'BestBtn','1','2025-10-07 19:52:45'),(284,533,534,1,'discord.gif','1','2025-10-07 19:52:45'),(285,535,536,1,'Ah','4','2025-10-07 19:52:45');
/*!40000 ALTER TABLE `uploaded` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `btn_size` int NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0' COMMENT '0=user, 1=light_admin, 2=super_admin',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Croby','$2b$12$a3L07du4iPqgJY7WcY14ge3cBkIlhYJLDzvYaGkHEb1SME6rmcWzy',80,'1_1759588491892.png',2),(2,'theo','$2b$12$g3mp7d8C1a0tFCmz0ZDnzO9LH3Qi0gaDi97xw3qs7S/CXaGZReouC',150,NULL,0),(3,'Kartman1985','$2b$12$dx7qa8z9pKiHKS.IZvtfqun32jetUUBxHz3BfgyttJFbphjkgWlmy',96,NULL,0),(4,'scoubidou','$2b$12$cWSXbRZ98OePUusEqJPiiuulvjyoS6gR3aTglaPevtFCA8b87lby6',150,NULL,0),(5,'alin','$2b$12$t2LYj0NvsYIwMWCKg.IoiOXx4nz1deh3v5hVSuSBNVXg9n0.LhSNG',110,NULL,0),(6,'Flow#14','$2b$12$DwvqytFd/Hv/Mliy.KuMoeTLxQGu/2s3aZjULaFZHwN5GyFV3qJPe',150,NULL,0),(7,'Loooh91','$2b$12$FSSPo3vE/RtV4pxPCvUMg.XnhMJXpnsdubQr5gVGBhMObAtEUQQwq',150,NULL,0),(8,'Brunico','$2b$12$FSSPo3vE/RtV4pxPCvUMg.XnhMJXpnsdubQr5gVGBhMObAtEUQQwq',150,NULL,0),(11,'Test','$2b$12$hyWc2kQ/l3da/0kn9FjX.uhPKwDe9hnQ0W.c9XZBj0HlahyUmBHeG',92,NULL,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-07 21:54:18

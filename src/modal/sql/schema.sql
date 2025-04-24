-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: myebs.in    Database: db_demo
-- ------------------------------------------------------
-- Server version	8.0.36-28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activation`
--

DROP TABLE IF EXISTS `activation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activation` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `activation_key` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `party` int unsigned NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `htmladdress` text,
  `city` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `state_code` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT 'India',
  `lmark` varchar(255) DEFAULT NULL,
  `notes` text,
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `party` (`party`),
  CONSTRAINT `address_ibfk_1` FOREIGN KEY (`party`) REFERENCES `party` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank`
--

DROP TABLE IF EXISTS `bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `bank_name` varchar(255) NOT NULL,
  `account_type` varchar(255) DEFAULT NULL,
  `account_holder` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `ifscode` varchar(255) DEFAULT NULL,
  `entity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact`
--

DROP TABLE IF EXISTS `contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `party` int unsigned DEFAULT NULL,
  `party_id` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `notes` text,
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `party` (`party`),
  CONSTRAINT `contact_ibfk_1` FOREIGN KEY (`party`) REFERENCES `party` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `value` decimal(9,2) DEFAULT NULL,
  `validity` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daybook`
--

DROP TABLE IF EXISTS `daybook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daybook` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `credit` decimal(9,2) DEFAULT NULL,
  `debit` decimal(9,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `defective_stock`
--

DROP TABLE IF EXISTS `defective_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `defective_stock` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) NOT NULL,
  `qty` decimal(9,3) DEFAULT '1.000',
  `description` varchar(255) DEFAULT NULL,
  `dnote_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dnote_id` (`dnote_id`),
  CONSTRAINT `defective_stock_ibfk_1` FOREIGN KEY (`dnote_id`) REFERENCES `purchase` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `discounts`
--

DROP TABLE IF EXISTS `discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `disc_name` varchar(255) NOT NULL,
  `value` decimal(9,2) DEFAULT NULL,
  `disc_type` varchar(10) DEFAULT '%',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `emp_advance`
--

DROP TABLE IF EXISTS `emp_advance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_advance` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `emp_id` int unsigned DEFAULT NULL,
  `pymt_date` date NOT NULL,
  `amount` decimal(9,3) NOT NULL,
  `pymt_mode` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `emp_id` (`emp_id`),
  CONSTRAINT `emp_advance_ibfk_1` FOREIGN KEY (`emp_id`) REFERENCES `employee` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `party` int DEFAULT NULL,
  `emp_id` varchar(255) DEFAULT NULL,
  `emp_name` varchar(255) NOT NULL,
  `birthday` date DEFAULT NULL,
  `joining` date DEFAULT NULL,
  `bg` varchar(5) DEFAULT NULL,
  `deg` varchar(255) DEFAULT NULL,
  `father` varchar(255) DEFAULT NULL,
  `mother` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `aadhaar` varchar(255) DEFAULT NULL,
  `hometown` varchar(255) DEFAULT NULL,
  `ecd` varchar(255) DEFAULT NULL,
  `ref` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(25) DEFAULT NULL,
  `salary` decimal(9,2) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `exprience` varchar(255) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `lwd` date DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `empsales`
--

DROP TABLE IF EXISTS `empsales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empsales` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `emp_id` int unsigned NOT NULL,
  `order_id` int unsigned DEFAULT NULL,
  `sales` decimal(9,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `emp_id` (`emp_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `empsales_ibfk_1` FOREIGN KEY (`emp_id`) REFERENCES `party` (`id`) ON DELETE CASCADE,
  CONSTRAINT `empsales_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `entity`
--

DROP TABLE IF EXISTS `entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entity` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `entity_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tag_line` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reg_num` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan_num` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst_num` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reg_since` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entity_id` (`entity_id`),
  UNIQUE KEY `entity_name` (`entity_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `amount` decimal(9,0) NOT NULL,
  `pymt_mode` varchar(255) DEFAULT NULL,
  `bank_mode` varchar(255) DEFAULT NULL,
  `pymt_method` int unsigned DEFAULT NULL,
  `exp_type` varchar(255) DEFAULT NULL,
  `description` text,
  `bank_id` int unsigned DEFAULT NULL,
  `user_id` int unsigned DEFAULT '1',
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bank_id` (`bank_id`),
  KEY `user_id` (`user_id`),
  KEY `pymt_method` (`pymt_method`),
  CONSTRAINT `expense_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expense_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expense_ibfk_3` FOREIGN KEY (`pymt_method`) REFERENCES `pymt_methods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `folders`
--

DROP TABLE IF EXISTS `folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `folder` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folder` (`folder`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) DEFAULT NULL,
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gst_rates`
--

DROP TABLE IF EXISTS `gst_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gst_rates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `rate` decimal(5,3) NOT NULL,
  `display_as` varchar(255) DEFAULT NULL,
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hold`
--

DROP TABLE IF EXISTS `hold`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hold` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `bill_type` varchar(255) NOT NULL,
  `party` int NOT NULL,
  `mtax` decimal(9,2) DEFAULT NULL,
  `disc` decimal(9,2) DEFAULT NULL,
  `disc_type` varchar(255) DEFAULT NULL,
  `disc_percent` decimal(3,2) DEFAULT NULL,
  `disc_notes` varchar(255) DEFAULT NULL,
  `freight` decimal(9,2) DEFAULT NULL,
  `pymt_amount` decimal(9,2) DEFAULT NULL,
  `cash` decimal(9,2) DEFAULT NULL,
  `bank` decimal(9,2) DEFAULT NULL,
  `other` decimal(9,2) DEFAULT NULL,
  `bank_mode` varchar(255) DEFAULT NULL,
  `pymt_method` varchar(255) DEFAULT NULL,
  `bank_id` int DEFAULT NULL,
  `txnid` varchar(255) DEFAULT NULL,
  `pymt_notes` varchar(255) DEFAULT NULL,
  `entity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `hold_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `holditems`
--

DROP TABLE IF EXISTS `holditems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holditems` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `hold_id` int unsigned NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `hsn` varchar(255) DEFAULT NULL,
  `qty` decimal(9,2) DEFAULT NULL,
  `product` varchar(255) DEFAULT NULL,
  `pcode` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `mrp` decimal(9,2) DEFAULT NULL,
  `price` decimal(9,2) DEFAULT NULL,
  `disc` decimal(9,2) DEFAULT NULL,
  `disc_val` decimal(9,2) DEFAULT NULL,
  `disc_per` decimal(9,2) DEFAULT NULL,
  `gst` decimal(9,2) DEFAULT NULL,
  `emp_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hold_id` (`hold_id`),
  CONSTRAINT `holditems_ibfk_1` FOREIGN KEY (`hold_id`) REFERENCES `hold` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `holds`
--

DROP TABLE IF EXISTS `holds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `party` varchar(255) DEFAULT NULL,
  `dated` date DEFAULT (curdate()),
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `party` int unsigned DEFAULT NULL,
  `group_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_party_group` (`party`,`group_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `details` text,
  `status` varchar(255) DEFAULT NULL,
  `folder_id` int unsigned DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `folder_id` (`folder_id`),
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `offer` varchar(255) NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `price` decimal(9,2) DEFAULT NULL,
  `min_qty` decimal(9,2) DEFAULT NULL,
  `validity` date DEFAULT NULL,
  `condition` varchar(255) DEFAULT NULL,
  `description` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` varchar(255) NOT NULL,
  `order_date` date NOT NULL,
  `order_type` varchar(255) DEFAULT NULL,
  `bill_type` varchar(255) DEFAULT NULL,
  `inv_number` varchar(255) DEFAULT NULL,
  `party` int unsigned DEFAULT NULL,
  `subtotal` decimal(9,2) DEFAULT NULL,
  `discount` decimal(9,2) DEFAULT NULL,
  `totaltax` decimal(9,2) DEFAULT NULL,
  `manual_tax` decimal(9,2) DEFAULT NULL,
  `freight` decimal(9,2) DEFAULT NULL,
  `round_off` decimal(9,2) DEFAULT NULL,
  `alltotal` decimal(9,2) DEFAULT NULL,
  `previous_due` decimal(9,2) DEFAULT NULL,
  `gst_type` varchar(255) DEFAULT NULL,
  `tax_type` varchar(255) DEFAULT NULL,
  `fin_year` varchar(4) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `adjustment` decimal(9,2) DEFAULT NULL,
  `ship_id` int unsigned DEFAULT NULL,
  `rewards` int DEFAULT NULL,
  `redeem` int DEFAULT NULL,
  `notes` text,
  `category` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `disc_id` int unsigned DEFAULT NULL,
  `disc_percent` decimal(5,2) DEFAULT NULL,
  `entity` int NOT NULL DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `ship_id` (`ship_id`),
  KEY `user_id` (`user_id`),
  KEY `party` (`party`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`ship_id`) REFERENCES `address` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`party`) REFERENCES `party` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB 5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `partner_id` int unsigned NOT NULL,
  `entity` int NOT NULL,
  `partnership` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partner_id` (`partner_id`),
  CONSTRAINT `partners_ibfk_1` FOREIGN KEY (`partner_id`) REFERENCES `party` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `party`
--

DROP TABLE IF EXISTS `party`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `party` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `party_id` varchar(255) DEFAULT NULL,
  `reg_date` date DEFAULT NULL,
  `party_type` varchar(255) DEFAULT 'Customer',
  `title` varchar(255) DEFAULT NULL,
  `party_name` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `pan_num` varchar(255) DEFAULT NULL,
  `gst_number` varchar(255) DEFAULT NULL,
  `birthday` varchar(255) DEFAULT NULL,
  `aadhaar` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `state_code` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT 'India',
  `rewards` decimal(9,2) DEFAULT NULL,
  `reward_percent` varchar(4) DEFAULT '1',
  `enable_rewards` tinyint(1) DEFAULT '1',
  `opening_bal` decimal(9,2) DEFAULT '0.00',
  `opening_cr` decimal(9,2) DEFAULT '0.00',
  `comments` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `party_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passbook`
--

DROP TABLE IF EXISTS `passbook`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passbook` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `bank_id` int unsigned NOT NULL,
  `txn_date` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `credit` decimal(9,2) DEFAULT NULL,
  `debit` decimal(9,2) DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bank_id` (`bank_id`),
  CONSTRAINT `passbook_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `party` int unsigned DEFAULT NULL,
  `supplier` int DEFAULT NULL,
  `pymt_date` date DEFAULT NULL,
  `pymt_for` varchar(255) DEFAULT 'Sales',
  `order_id` int unsigned DEFAULT NULL,
  `purch_id` int unsigned DEFAULT NULL,
  `amount` decimal(9,2) NOT NULL,
  `cash` decimal(9,2) DEFAULT NULL,
  `bank` decimal(9,2) DEFAULT NULL,
  `other` decimal(9,2) DEFAULT NULL,
  `bank_mode` varchar(255) DEFAULT NULL,
  `pymt_method` int unsigned DEFAULT NULL,
  `bank_id` int unsigned DEFAULT NULL,
  `txnid` varchar(255) DEFAULT NULL,
  `adjustment` decimal(9,2) DEFAULT NULL,
  `forfiet` decimal(9,2) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `purch_id` (`purch_id`),
  KEY `bank_id` (`bank_id`),
  KEY `pymt_method` (`pymt_method`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`purch_id`) REFERENCES `purchase` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_ibfk_4` FOREIGN KEY (`pymt_method`) REFERENCES `pymt_methods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchase`
--

DROP TABLE IF EXISTS `purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `supid` int unsigned DEFAULT NULL,
  `order_date` date DEFAULT (curdate()),
  `order_number` varchar(255) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `bill_type` varchar(255) DEFAULT NULL,
  `bill_number` varchar(255) DEFAULT NULL,
  `sub_total` decimal(9,2) DEFAULT NULL,
  `discount` decimal(9,2) DEFAULT NULL,
  `tax_amount` decimal(9,2) DEFAULT NULL,
  `gst_roundoff` decimal(2,2) DEFAULT NULL,
  `freight` decimal(9,2) DEFAULT NULL,
  `bill_amount` decimal(9,2) DEFAULT NULL,
  `quantity` decimal(9,2) DEFAULT NULL,
  `ref_filename` varchar(255) DEFAULT NULL,
  `fin_year` varchar(4) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pymt_methods`
--

DROP TABLE IF EXISTS `pymt_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pymt_methods` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `method` varchar(255) DEFAULT NULL,
  `default_bank` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `default_bank` (`default_bank`),
  CONSTRAINT `pymt_methods_ibfk_1` FOREIGN KEY (`default_bank`) REFERENCES `bank` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `pymtfyear`
--

DROP TABLE IF EXISTS `pymtfyear`;
/*!50001 DROP VIEW IF EXISTS `pymtfyear`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `pymtfyear` AS SELECT 
 1 AS `id`,
 1 AS `party`,
 1 AS `supplier`,
 1 AS `pymt_date`,
 1 AS `pymt_for`,
 1 AS `order_id`,
 1 AS `purch_id`,
 1 AS `amount`,
 1 AS `cash`,
 1 AS `bank`,
 1 AS `bank_name`,
 1 AS `other`,
 1 AS `bank_mode`,
 1 AS `pymt_method`,
 1 AS `payment_method`,
 1 AS `bank_id`,
 1 AS `txnid`,
 1 AS `adjustment`,
 1 AS `notes`,
 1 AS `entity`,
 1 AS `timestamp`,
 1 AS `fin_year`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `restrictions`
--

DROP TABLE IF EXISTS `restrictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restrictions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userid` int unsigned NOT NULL,
  `change_order_date` tinyint(1) DEFAULT '0',
  `change_product_mode` tinyint(1) DEFAULT '1',
  `manual_bill` tinyint(1) DEFAULT '1',
  `edit_order` tinyint(1) DEFAULT '0',
  `edit_payment` tinyint(1) DEFAULT '0',
  `edit_entity` tinyint(1) DEFAULT '0',
  `edit_party` tinyint(1) DEFAULT '1',
  `edit_bank` tinyint(1) DEFAULT '0',
  `edit_expense` tinyint(1) DEFAULT '0',
  `edit_stock` tinyint(1) DEFAULT '0',
  `edit_purchase` tinyint(1) DEFAULT '0',
  `edit_settigns` tinyint(1) DEFAULT '0',
  `delete_order` tinyint(1) DEFAULT '0',
  `delete_payment` tinyint(1) DEFAULT '0',
  `delete_stock` tinyint(1) DEFAULT '0',
  `delete_purchase` tinyint(1) DEFAULT '0',
  `delete_bank` tinyint(1) DEFAULT '0',
  `delete_expense` tinyint(1) DEFAULT '0',
  `delete_entity` tinyint(1) DEFAULT '0',
  `view_sales` tinyint(1) DEFAULT '0',
  `view_employees` tinyint(1) DEFAULT '0',
  `view_partydues` tinyint(1) DEFAULT '0',
  `view_expenses` tinyint(1) DEFAULT '1',
  `view_orders` tinyint(1) DEFAULT '1',
  `view_closing` tinyint(1) DEFAULT '1',
  `view_purchase` tinyint(1) DEFAULT '1',
  `create_bank` tinyint(1) DEFAULT '0',
  `create_stock` tinyint(1) DEFAULT '0',
  `create_entity` tinyint(1) DEFAULT '0',
  `create_refund` tinyint(1) DEFAULT '0',
  `create_purchase` tinyint(1) DEFAULT '0',
  `create_user` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `userid` (`userid`),
  CONSTRAINT `restrictions_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rewards`
--

DROP TABLE IF EXISTS `rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rewards` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `party` int NOT NULL,
  `rewards` decimal(9,2) DEFAULT '0.00',
  `redeemed` decimal(9,2) DEFAULT '0.00',
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `rewards_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salary`
--

DROP TABLE IF EXISTS `salary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `emp_id` int unsigned NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(9,2) DEFAULT '0.00',
  `entry_for` varchar(255) DEFAULT 'salary',
  `pymt_mode` varchar(255) DEFAULT NULL,
  `bank_mode` varchar(255) DEFAULT NULL,
  `bank_id` int unsigned DEFAULT NULL,
  `description` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `emp_id` (`emp_id`),
  KEY `bank_id` (`bank_id`),
  CONSTRAINT `salary_ibfk_1` FOREIGN KEY (`emp_id`) REFERENCES `party` (`id`) ON DELETE CASCADE,
  CONSTRAINT `salary_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `entity` int DEFAULT '1',
  `rewards` tinyint(1) DEFAULT '0',
  `strict_mode` tinyint(1) DEFAULT '0',
  `default_bank` int DEFAULT NULL,
  `service_email` varchar(255) DEFAULT NULL,
  `email_client` varchar(255) DEFAULT NULL,
  `email_pwd` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sold`
--

DROP TABLE IF EXISTS `sold`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sold` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `hsn` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `qty` decimal(9,3) DEFAULT NULL,
  `product` varchar(255) DEFAULT NULL,
  `pcode` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `mrp` decimal(9,2) DEFAULT NULL,
  `price` decimal(9,2) DEFAULT NULL,
  `disc` decimal(9,2) DEFAULT NULL,
  `gst` decimal(9,2) DEFAULT NULL,
  `tax` decimal(9,2) DEFAULT NULL,
  `net` decimal(9,2) DEFAULT NULL,
  `gross` decimal(9,2) DEFAULT NULL,
  `disc_val` decimal(9,2) DEFAULT NULL,
  `disc_per` decimal(9,2) DEFAULT NULL,
  `emp_id` int DEFAULT NULL,
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `sold_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB 2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) NOT NULL,
  `ean` varchar(255) DEFAULT NULL,
  `hsn` varchar(255) DEFAULT NULL,
  `upc` varchar(255) DEFAULT NULL,
  `pcode` varchar(255) DEFAULT NULL,
  `product` varchar(255) NOT NULL,
  `mrp` decimal(9,2) DEFAULT NULL,
  `price` decimal(9,2) DEFAULT NULL,
  `wsp` decimal(9,2) DEFAULT NULL,
  `sale_price` decimal(9,2) DEFAULT NULL,
  `gst` decimal(5,2) DEFAULT NULL,
  `purch_price` decimal(9,2) DEFAULT NULL,
  `cost` decimal(9,2) DEFAULT NULL,
  `cost_gst` decimal(5,2) DEFAULT NULL,
  `cost_tax` decimal(5,2) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `qty` decimal(9,3) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `discount` decimal(9,2) DEFAULT NULL,
  `disc_type` varchar(255) DEFAULT NULL,
  `colour` varchar(255) DEFAULT NULL,
  `season` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `comments` text,
  `purch_id` int unsigned DEFAULT NULL,
  `purch_date` date DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `updated_qty` decimal(9,3) DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `temp_id` varchar(255) DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `purch_id` (`purch_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`purch_id`) REFERENCES `purchase` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `stock_view`
--

DROP TABLE IF EXISTS `stock_view`;
/*!50001 DROP VIEW IF EXISTS `stock_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `stock_view` AS SELECT 
 1 AS `id`,
 1 AS `sku`,
 1 AS `ean`,
 1 AS `hsn`,
 1 AS `upc`,
 1 AS `pcode`,
 1 AS `product`,
 1 AS `mrp`,
 1 AS `price`,
 1 AS `wsp`,
 1 AS `sale_price`,
 1 AS `gst`,
 1 AS `purch_price`,
 1 AS `cost`,
 1 AS `cost_gst`,
 1 AS `unit`,
 1 AS `size`,
 1 AS `qty`,
 1 AS `type`,
 1 AS `discount`,
 1 AS `disc_type`,
 1 AS `colour`,
 1 AS `season`,
 1 AS `section`,
 1 AS `category`,
 1 AS `label`,
 1 AS `tag`,
 1 AS `brand`,
 1 AS `vendor`,
 1 AS `comments`,
 1 AS `purch_id`,
 1 AS `purch_date`,
 1 AS `image`,
 1 AS `updated_qty`,
 1 AS `user_id`,
 1 AS `temp_id`,
 1 AS `entity`,
 1 AS `timestamp`,
 1 AS `entry_date`,
 1 AS `purchase_date`,
 1 AS `po_number`,
 1 AS `supid`,
 1 AS `sold`,
 1 AS `gr`,
 1 AS `dq`,
 1 AS `avl_qty`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `stockavl`
--

DROP TABLE IF EXISTS `stockavl`;
/*!50001 DROP VIEW IF EXISTS `stockavl`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `stockavl` AS SELECT 
 1 AS `id`,
 1 AS `sku`,
 1 AS `product`,
 1 AS `pcode`,
 1 AS `qty`,
 1 AS `mrp`,
 1 AS `size`,
 1 AS `brand`,
 1 AS `entry_date`,
 1 AS `avlqty`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `stockreturn`
--

DROP TABLE IF EXISTS `stockreturn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stockreturn` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `purch_id` int unsigned NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `product` varchar(255) DEFAULT NULL,
  `qty` decimal(9,3) DEFAULT NULL,
  `cost` decimal(9,2) DEFAULT NULL,
  `cost_gst` decimal(5,2) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `hsn` varchar(255) DEFAULT NULL,
  `entity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `purch_id` (`purch_id`),
  CONSTRAINT `stockreturn_ibfk_1` FOREIGN KEY (`purch_id`) REFERENCES `purchase` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sup_id` varchar(255) DEFAULT NULL,
  `reg_date` date DEFAULT (curdate()),
  `title` varchar(255) DEFAULT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `gst_number` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `state_code` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT 'India',
  `opening_bal` decimal(9,2) DEFAULT '0.00',
  `comments` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `supplier_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_role` varchar(255) NOT NULL DEFAULT 'user',
  `is_active` varchar(255) NOT NULL DEFAULT 'yes',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `google_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`sa_demo`@`%`*/ /*!50003 TRIGGER `after_user_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN INSERT INTO `restrictions` (`userid`) VALUES (NEW.id); END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `viewstock`
--

DROP TABLE IF EXISTS `viewstock`;
/*!50001 DROP VIEW IF EXISTS `viewstock`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `viewstock` AS SELECT 
 1 AS `id`,
 1 AS `sku`,
 1 AS `ean`,
 1 AS `hsn`,
 1 AS `upc`,
 1 AS `pcode`,
 1 AS `product`,
 1 AS `mrp`,
 1 AS `price`,
 1 AS `wsp`,
 1 AS `sale_price`,
 1 AS `gst`,
 1 AS `purch_price`,
 1 AS `cost`,
 1 AS `cost_gst`,
 1 AS `cost_tax`,
 1 AS `unit`,
 1 AS `size`,
 1 AS `qty`,
 1 AS `type`,
 1 AS `discount`,
 1 AS `disc_type`,
 1 AS `colour`,
 1 AS `season`,
 1 AS `section`,
 1 AS `category`,
 1 AS `label`,
 1 AS `tag`,
 1 AS `brand`,
 1 AS `vendor`,
 1 AS `comments`,
 1 AS `purch_id`,
 1 AS `purch_date`,
 1 AS `image`,
 1 AS `updated_qty`,
 1 AS `user_id`,
 1 AS `temp_id`,
 1 AS `entity`,
 1 AS `timestamp`,
 1 AS `prchd_on`,
 1 AS `bill_number`,
 1 AS `supid`,
 1 AS `supplier`,
 1 AS `sold`,
 1 AS `returned`,
 1 AS `defect`,
 1 AS `available`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `pymtfyear`
--

/*!50001 DROP VIEW IF EXISTS `pymtfyear`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`master`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `pymtfyear` AS select `y`.`id` AS `id`,coalesce(`y`.`party`,`o`.`party`) AS `party`,coalesce(`y`.`supplier`,`u`.`supid`) AS `supplier`,coalesce(`y`.`pymt_date`,`o`.`order_date`,`u`.`bill_date`) AS `pymt_date`,`y`.`pymt_for` AS `pymt_for`,`y`.`order_id` AS `order_id`,`y`.`purch_id` AS `purch_id`,`y`.`amount` AS `amount`,`y`.`cash` AS `cash`,`y`.`bank` AS `bank`,`b`.`bank_name` AS `bank_name`,`y`.`other` AS `other`,`y`.`bank_mode` AS `bank_mode`,`y`.`pymt_method` AS `pymt_method`,`m`.`method` AS `payment_method`,`y`.`bank_id` AS `bank_id`,`y`.`txnid` AS `txnid`,`y`.`adjustment` AS `adjustment`,`y`.`notes` AS `notes`,`y`.`entity` AS `entity`,`y`.`timestamp` AS `timestamp`,if((month(coalesce(`y`.`pymt_date`,`o`.`order_date`,`u`.`bill_date`)) > 3),(year(coalesce(`y`.`pymt_date`,`o`.`order_date`,`u`.`bill_date`)) + 1),year(coalesce(`y`.`pymt_date`,`o`.`order_date`,`u`.`bill_date`))) AS `fin_year` from ((((`payments` `y` left join `orders` `o` on((`y`.`order_id` = `o`.`id`))) left join `purchase` `u` on((`y`.`purch_id` = `u`.`id`))) left join `bank` `b` on((`y`.`bank_id` = `b`.`id`))) left join `pymt_methods` `m` on((`y`.`pymt_method` = `m`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `stock_view`
--

/*!50001 DROP VIEW IF EXISTS `stock_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`master`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `stock_view` AS select `s`.`id` AS `id`,`s`.`sku` AS `sku`,`s`.`ean` AS `ean`,`s`.`hsn` AS `hsn`,`s`.`upc` AS `upc`,`s`.`pcode` AS `pcode`,`s`.`product` AS `product`,`s`.`mrp` AS `mrp`,`s`.`price` AS `price`,`s`.`wsp` AS `wsp`,`s`.`sale_price` AS `sale_price`,`s`.`gst` AS `gst`,`s`.`purch_price` AS `purch_price`,`s`.`cost` AS `cost`,`s`.`cost_gst` AS `cost_gst`,`s`.`unit` AS `unit`,`s`.`size` AS `size`,`s`.`qty` AS `qty`,`s`.`type` AS `type`,`s`.`discount` AS `discount`,`s`.`disc_type` AS `disc_type`,`s`.`colour` AS `colour`,`s`.`season` AS `season`,`s`.`section` AS `section`,`s`.`category` AS `category`,`s`.`label` AS `label`,`s`.`tag` AS `tag`,`s`.`brand` AS `brand`,`s`.`vendor` AS `vendor`,`s`.`comments` AS `comments`,`s`.`purch_id` AS `purch_id`,`s`.`purch_date` AS `purch_date`,`s`.`image` AS `image`,`s`.`updated_qty` AS `updated_qty`,`s`.`user_id` AS `user_id`,`s`.`temp_id` AS `temp_id`,`s`.`entity` AS `entity`,`s`.`timestamp` AS `timestamp`,date_format(`s`.`timestamp`,'%Y-%m-%d') AS `entry_date`,coalesce(`u`.`bill_date`,`u`.`order_date`) AS `purchase_date`,`u`.`order_number` AS `po_number`,`u`.`supid` AS `supid`,`l`.`sold` AS `sold`,`r`.`gr` AS `gr`,`ds`.`dq` AS `dq`,((`s`.`qty` - coalesce(`r`.`gr`,0)) - coalesce(`l`.`sold`,0)) AS `avl_qty` from ((((`stock` `s` left join `purchase` `u` on((`u`.`id` = `s`.`purch_id`))) left join (select `sold`.`sku` AS `sku`,sum(`sold`.`qty`) AS `sold` from `sold` group by `sold`.`sku`) `l` on((`l`.`sku` = `s`.`sku`))) left join (select `stockreturn`.`sku` AS `sku`,sum(`stockreturn`.`qty`) AS `gr` from `stockreturn` group by `stockreturn`.`sku`) `r` on((`r`.`sku` = `s`.`sku`))) left join (select `defective_stock`.`sku` AS `sku`,sum(`defective_stock`.`qty`) AS `dq` from `defective_stock` where (`defective_stock`.`dnote_id` is null) group by `defective_stock`.`sku`) `ds` on((`ds`.`sku` = `s`.`sku`))) order by `s`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `stockavl`
--

/*!50001 DROP VIEW IF EXISTS `stockavl`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`sa_demo`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `stockavl` AS select `stk`.`id` AS `id`,`stk`.`sku` AS `sku`,`stk`.`product` AS `product`,`stk`.`pcode` AS `pcode`,`stk`.`qty` AS `qty`,`stk`.`mrp` AS `mrp`,`stk`.`size` AS `size`,`stk`.`brand` AS `brand`,`stk`.`entry_date` AS `entry_date`,`stk`.`avlqty` AS `avlqty` from (select `s`.`id` AS `id`,`s`.`sku` AS `sku`,`s`.`product` AS `product`,coalesce(`s`.`pcode`,'') AS `pcode`,`s`.`qty` AS `qty`,`s`.`mrp` AS `mrp`,coalesce(`s`.`size`,'') AS `size`,coalesce(`s`.`brand`,'') AS `brand`,date_format(`s`.`timestamp`,'%d-%m-%Y') AS `entry_date`,(`s`.`qty` - coalesce((`sq`.`sqty` + `rq`.`rqty`),0)) AS `avlqty` from ((`stock` `s` left join (select `sold`.`sku` AS `sku`,sum(`sold`.`qty`) AS `sqty` from `sold` where (`sold`.`qty` > 0) group by `sold`.`sku`) `sq` on((`sq`.`sku` = `s`.`sku`))) left join (select `sold`.`sku` AS `sku`,sum(`sold`.`qty`) AS `rqty` from `sold` where (`sold`.`qty` < 0) group by `sold`.`sku`) `rq` on((`rq`.`sku` = `s`.`sku`)))) `stk` where (`stk`.`avlqty` > 0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `viewstock`
--

/*!50001 DROP VIEW IF EXISTS `viewstock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`master`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `viewstock` AS select `s`.`id` AS `id`,`s`.`sku` AS `sku`,`s`.`ean` AS `ean`,`s`.`hsn` AS `hsn`,`s`.`upc` AS `upc`,`s`.`pcode` AS `pcode`,`s`.`product` AS `product`,`s`.`mrp` AS `mrp`,`s`.`price` AS `price`,`s`.`wsp` AS `wsp`,`s`.`sale_price` AS `sale_price`,`s`.`gst` AS `gst`,`s`.`purch_price` AS `purch_price`,`s`.`cost` AS `cost`,`s`.`cost_gst` AS `cost_gst`,`s`.`cost_tax` AS `cost_tax`,`s`.`unit` AS `unit`,`s`.`size` AS `size`,`s`.`qty` AS `qty`,`s`.`type` AS `type`,`s`.`discount` AS `discount`,`s`.`disc_type` AS `disc_type`,`s`.`colour` AS `colour`,`s`.`season` AS `season`,`s`.`section` AS `section`,`s`.`category` AS `category`,`s`.`label` AS `label`,`s`.`tag` AS `tag`,`s`.`brand` AS `brand`,`s`.`vendor` AS `vendor`,`s`.`comments` AS `comments`,`s`.`purch_id` AS `purch_id`,`s`.`purch_date` AS `purch_date`,`s`.`image` AS `image`,`s`.`updated_qty` AS `updated_qty`,`s`.`user_id` AS `user_id`,`s`.`temp_id` AS `temp_id`,`s`.`entity` AS `entity`,`s`.`timestamp` AS `timestamp`,date_format(coalesce(`u`.`bill_date`,`u`.`order_date`),'%d-%m-%Y') AS `prchd_on`,`u`.`bill_number` AS `bill_number`,`u`.`supid` AS `supid`,`p`.`supplier_name` AS `supplier`,`l`.`sold` AS `sold`,`r`.`returned` AS `returned`,`ds`.`defect` AS `defect`,((`s`.`qty` - coalesce(`r`.`returned`,0)) - coalesce(`l`.`sold`,0)) AS `available` from (((((`stock` `s` left join `purchase` `u` on((`u`.`id` = `s`.`purch_id`))) left join `supplier` `p` on((`p`.`id` = `u`.`supid`))) left join (select `sold`.`sku` AS `sku`,sum(`sold`.`qty`) AS `sold` from `sold` group by `sold`.`sku`) `l` on((`l`.`sku` = `s`.`sku`))) left join (select `stockreturn`.`sku` AS `sku`,sum(`stockreturn`.`qty`) AS `returned` from `stockreturn` group by `stockreturn`.`sku`) `r` on((`r`.`sku` = `s`.`sku`))) left join (select `defective_stock`.`sku` AS `sku`,sum(`defective_stock`.`qty`) AS `defect` from `defective_stock` where (`defective_stock`.`dnote_id` is null) group by `defective_stock`.`sku`) `ds` on((`ds`.`sku` = `s`.`sku`))) order by `s`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-22 10:24:02

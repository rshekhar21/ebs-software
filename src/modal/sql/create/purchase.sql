-- Active: 1712733372936@@myebs.in@3306@db_demo

CREATE TABLE IF NOT EXISTS `purchase` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `supid` INT UNSIGNED NULL,
    `order_date` DATE NULL DEFAULT (CURRENT_DATE),
    `order_number` VARCHAR(255) NULL,
    `bill_date` DATE NULL,
    `bill_type` VARCHAR(255) NULL,
    `bill_number` VARCHAR(255) NULL,
    `sub_total` DECIMAL(9, 2) NULL,
    `discount` DECIMAL(9, 2) NULL,
    `tax_amount` DECIMAL(9, 2) NULL,
    `freight` DECIMAL(9, 2) NULL,
    `bill_amount` DECIMAL(9, 2) NULL,
    `quantity` DECIMAL(9, 2) NULL,
    `ref_filename` VARCHAR(255) NULL,
    `fin_year` VARCHAR(4) NULL,
    `notes` VARCHAR(255) NULL,
    `user_id` INT UNSIGNED NULL,
    `entity` INT DEFAULT 1,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
-- Active: 1728019028452@@ebsserver.in@3306@db_rajimpex
SELECT * FROM purchase;
SHOW CREATE TABLE purchase;



CREATE TABLE `purchase` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `supid` int DEFAULT NULL,
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
  `user_id` int DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

show tables;
desc test;
drop table if exists test;

create Table if not exists pooja_samagri.`holds`(`id` INT AUTO_INCREMENT PRIMARY KEY, `party` VARCHAR(255), `dated` DATE DEFAULT (CURRENT_DATE), `data` JSON);

INSERT INTO test(`data`) values('{ "name": "raj", "contact": "9910075648"}');

SELECT * FROM `holds` WHERE id = 1;


SELECT * FROM payments;

select * from payments where order_id = 74;
SELECT * FROM purchase;

SHOW CREATE TABLE supplier;

-- ALTER TABLE supplier MODIFY COLUMN `reg_date` date DEFAULT(CURRENT_DATE);
CREATE TABLE IF NOT EXISTS `supplier` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sup_id` varchar(255) DEFAULT NULL,
  `reg_date` date DEFAULT(CURRENT_DATE),
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
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

SELECT * FROM supplier;

SHOW CREATE TABLE purchase;

CREATE TABLE `purchase` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `supid` int DEFAULT NULL,
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
  `user_id` int DEFAULT NULL,
  `entity` int DEFAULT '1',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

SHOW CREATE TABLE payments;
CREATE TABLE `payments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `party` int DEFAULT NULL,
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
) ENGINE=InnoDB;

show TABLES;

ALTER Table `payments` ADD COLUMN `supplier` int default null after `party`;

CREATE OR REPLACE VIEW `pymtfyear` AS
SELECT
    y.`id`,
    coalesce( y.`party`, o.`party`, u.`supid` ) as `party`,
    y.`supplier`,
    coalesce( y.`pymt_date`, o.`order_date`, u.`bill_date` ) as `pymt_date`,
    y.`pymt_for`,
    y.`order_id`,
    y.`purch_id`,
    y.`amount`,
    y.`cash`,
    y.`bank`,
    b.`bank_name`,
    y.`other`,
    y.`bank_mode`,
    y.`pymt_method`,
    m.`method` AS `payment_method`,
    y.`bank_id`,
    y.`txnid`,
    y.`adjustment`,
    y.`notes`,
    y.`entity`,
    y.`timestamp`,
    IF(
        MONTH(
            COALESCE(
                y.`pymt_date`, o.`order_date`, u.`bill_date`
            )
        ) > 3, YEAR(
            COALESCE(
                y.`pymt_date`, o.`order_date`, u.`bill_date`
            )
        ) + 1, YEAR(
            COALESCE(
                y.`pymt_date`, o.`order_date`, u.`bill_date`
            )
        )
    ) AS `fin_year`
FROM
    `payments` y
    LEFT JOIN `orders` o ON y.`order_id` = o.`id`
    LEFT JOIN `purchase` u ON y.`purch_id` = u.`id`
    LEFT JOIN `bank` b ON y.`bank_id` = b.`id`
    LEFT JOIN `pymt_methods` m ON y.`pymt_method` = m.`id`;



CREATE OR REPLACE VIEW `viewstock` AS
SELECT
    s.*,
    DATE_FORMAT(
        COALESCE(u.`bill_date`, u.`order_date`),
        '%d/%m/%Y'
    ) AS `prchd_on`,
    u.`bill_number`,
    u.`supid`,
    su.`supplier_name` as `supplier`,
    l.`sold`,
    r.`returned`,
    ds.`defect`,
    (
        s.`qty` - COALESCE(r.`returned`, 0) - COALESCE(l.`sold`, 0)
    ) AS `available`
FROM
    `stock` s
    LEFT JOIN `purchase` u ON u.`id` = s.`purch_id`
    LEFT JOIN `party` p ON p.`id` = u.`supid`
    LEFT JOIN `supplier` su ON su.id = u.`supid`
    LEFT JOIN (
        SELECT `sku`, SUM(`qty`) AS `sold`
        FROM `sold`
        GROUP BY
            `sku`
    ) l ON l.`sku` = s.`sku`
    LEFT JOIN (
        SELECT `sku`, SUM(`qty`) AS `returned`
        FROM `stockreturn`
        GROUP BY
            `sku`
    ) r ON r.`sku` = s.`sku`
    LEFT JOIN (
        SELECT `sku`, SUM(`qty`) as `defect`
        FROM `defective_stock`
        WHERE
            `dnote_id` IS NULL
        GROUP BY
            `sku`
    ) ds on ds.`sku` = s.`sku`
ORDER BY s.`id` ASC;

DESC viewstock;

SHOW CREATE view viewstock;


SELECT MAX(id) + 101 as sup_id FROM supplier;

SELECT * FROM supplier;

SELECT id, party_name, contact, email, gst_number, address, city, pincode, state FROM party WHERE party_type = 'supplier';

UPDATE `purchase` SET `supid` = 10 WHERE `supid` = 16;

SELECT * FROM supplier;
SELECT * FROM party;

-- DELETE FROM gzxynqgulilv.orders WHERE id > 0;
-- ALTER Table gzxynqgulilv.orders AUTO_INCREMENT = 1;

-- DELETE FROM gzxynqgulilv.payments WHERE id > 0;
-- ALTER Table gzxynqgulilv.payments AUTO_INCREMENT = 1;

-- DELETE FROM gzxynqgulilv.party WHERE id > 0;
-- ALTER Table gzxynqgulilv.party AUTO_INCREMENT = 1;

-- DELETE FROM gzxynqgulilv.sold WHERE id > 0;
-- ALTER Table gzxynqgulilv.sold AUTO_INCREMENT = 1;

-- INSERT INTO gzxynqgulilv.party SELECT * FROM gbxecgjdbxwi.party;

SELECT * FROM orders order by id desc LIMIT 5;
SELECT COUNT(*) FROM orders;

SELECT * FROM sold ORDER BY id DESC LIMIT 5;
SELECT COUNT(*) FROM sold;

SELECT DISTINCT party FROM orders;

SELECT MAX(`party_id`) `id` FROM party;
SELECT id, party_id FROM party ORDER BY id DESC LIMIT 500;

SELECT y.`id`, date_format(y.`pymt_date`, '%d/%m/%Y') AS `dated`, COALESCE(p.`party_name`, s.`supplier_name`) AS `party`, p.`id` AS `party_id`, y.`amount`, y.`cash`, y.`bank`, y.`bank_mode` `mode`, py.`method`, b.`bank_name` AS `account`, y.`adjustment` `adj`, y.`order_id`, y.`purch_id`, y.`pymt_for`, y.`notes` FROM `pymtfyear` y left JOIN `party` p ON p.`id` = y.`party` LEFT JOIN `supplier` s ON s.`id` = y.`supplier` LEFT JOIN `bank` b ON b.`id` = y.`bank_id` left JOIN `pymt_methods` py ON py.`id` = y.`pymt_method` WHERE (p.`party_name` LIKE 'raj' OR s.`supplier_name` LIKE 'raj' OR p.contact LIKE 'raj') order by y.`pymt_date` desc, y.`id` DESC limit 100;

SELECT `id`, `party_name` AS `party`, `party_id`, `contact` FROM `party` WHERE `party_type` <> 'supplier' AND (`party_name` LIKE 'search' OR contact LIKE 'search') LIMIT 10;

SELECT s.`id`, s.`sku`, s.`hsn`, s.`product`, s.`pcode`, s.`unit`, COALESCE(s.`price`, s.`mrp`, s.`wsp`) AS `price`, s.`gst`, s.`size`, NULL AS `disc`, s.`sold`, s.`available` AS `avl`, 1 AS qty, CASE WHEN s.`disc_type` = '%' THEN s.`discount` ELSE NULL END AS `disc_per`, CASE WHEN s.`disc_type` IS NULL THEN s.`discount` ELSE NULL END AS `disc_val`, NULL AS `emp_id`, s.`season`, s.`section`, s.`category`, s.`colour`, s.`ean`, s.`brand`, s.`image`, coalesce(s.`sold`, 0) AS `sold` FROM `viewstock` s WHERE s.`available` > 0 AND (s.`product` LIKE 'stole' OR s.`pcode` LIKE 'stole' OR s.`sku` LIKE 'stole' OR s.`hsn` LIKE 'stole' OR s.`supplier` LIKE 'stole' OR s.`category` LIKE 'stole' OR s.`section` LIKE 'stole' OR s.`season` LIKE 'stole' OR s.`ean` LIKE 'stole' OR s.`colour` LIKE 'stole' OR s.`brand` LIKE 'stole') ORDER BY s.`available` DESC LIMIT 30;

SELECT s.`id`, s.`sku`, s.`hsn`, s.`product`, s.`pcode`, s.`unit`,COALESCE(s.`price`, s.`mrp`, s.`wsp`) AS `price`, s.`gst`, s.`size`, NULL AS `disc`, s.`sold`, s.`available` AS `avl`, 1 AS qty, CASE WHEN s.`disc_type` = '%' THEN s.`discount` ELSE NULL END AS `disc_per`, CASE WHEN s.`disc_type` IS NULL THEN s.`discount` ELSE NULL END AS `disc_val`, NULL AS `emp_id`, s.`season`, s.`section`, s.`category`, s.`colour`, s.`ean`, s.`brand`, s.`image`, coalesce(s.`sold`, 0) AS `sold` FROM `viewstock` s WHERE (s.`product` LIKE 'ka' OR s.`pcode` LIKE 'ka' OR s.`sku` LIKE 'ka' OR s.`hsn` LIKE 'ka' OR s.`supplier` = 'ka' OR s.`category` LIKE 'ka' OR s.`section` LIKE 'ka' OR s.`season` LIKE 'ka' OR s.`ean` LIKE 'ka' OR s.`colour` LIKE 'ka' OR s.`brand` LIKE 'ka') ORDER BY s.`available` DESC LIMIT 30;


SELECT id, DATE_FORMAT(order_date, '%d/%m/%Y') as `dated`, `subtotal`, discount as disc, freight, totaltax as tax, alltotal as total, y.payment FROM orders o LEFT JOIN(SELECT order_id, sum(amount) as `payment` FROM pymtfyear GROUP BY order_id) y ON y.order_id = o.id WHERE o.party = 1 AND o.order_date BETWEEN '2025-04-01' AND '2025-04-04';

SELECT * FROM ( SELECT o.`id`, DATE_FORMAT(`order_date`, '%d-%m-%Y') AS `dated`, 'Order' AS type, o.`subtotal`, o.`discount`, o.`freight`, o.`totaltax` AS `tax`, o.`alltotal` AS `total`, o.`previous_due` as `dues_clear`, y.`payment`, o.`alltotal` - COALESCE(y.`payment`,0) AS `balance`, o.timestamp FROM `orders` o LEFT JOIN (SELECT `order_id`, SUM(`amount`) AS `payment` FROM `pymtfyear` GROUP BY `order_id`) y ON y.`order_id` = o.`id` WHERE o.`party` = 1 UNION ALL SELECT `id`, DATE_FORMAT(`pymt_date`, '%d-%m-%Y') AS `dated`, 'Payment' AS type, NULL AS `subtotal`, `adjustment` AS `discount`, NULL AS `freight`, NULL AS `tax`, NULL AS `total`, null as `dues_clear`, `amount` AS `payment`, null as `balance`, `timestamp` FROM `pymtfyear` WHERE `party` = 1 AND `order_id` IS NULL ) x ORDER BY x.`timestamp` DESC;
SELECT *
FROM (
    SELECT
        y.`id`,
        CAST(date_format(y.`pymt_date`, '%d/%m/%Y') AS CHAR CHARACTER SET utf8) AS `dated`,
        CAST(date_format(y.`pymt_date`, '%Y-%m-%d') AS CHAR CHARACTER SET utf8) AS `pymt_date`,
        CAST(p.`party_name` AS CHAR CHARACTER SET utf8) AS `party/supplier`,
        y.`pymt_for`,
        p.`id` AS `party`,
        y.`amount` as `payment`,
        y.`cash`,
        y.`bank`,
        y.`other`,
        y.`bank_id`,
        y.`bank_mode`,
        y.`pymt_method`,
        y.`payment_method`,
        CAST(y.`bank_name` AS CHAR CHARACTER SET utf8) AS `bank_name`,
        y.`adjustment` AS `forefiet`,
        y.`order_id`,
        y.`purch_id`,
        CAST(y.`notes` AS CHAR CHARACTER SET utf8) AS `notes`
    FROM `pymtfyear` y
    LEFT JOIN `party` p ON p.`id` = y.`party`
    WHERE
        y.`pymt_for` = 'Sales'
    UNION ALL
    SELECT
        y.`id`,
        CAST(date_format(y.`pymt_date`, '%d/%m/%Y') AS CHAR CHARACTER SET utf8) AS `dated`,
        CAST(date_format(y.`pymt_date`, '%Y-%m-%d') AS CHAR CHARACTER SET utf8) AS `pymt_date`,
        CAST(s.`supplier_name` AS CHAR CHARACTER SET utf8) AS `party/supplier`,
        y.`pymt_for`,
        s.`id` AS `party`,
        y.`amount` as `payment`,
        y.`cash`,
        y.`bank`,
        y.`other`,
        y.`bank_id`,
        y.`bank_mode`,
        y.`pymt_method`,
        y.`payment_method`,
        CAST(y.`bank_name` AS CHAR CHARACTER SET utf8) AS `bank_name`,
        y.`adjustment` AS `forefiet`,
        y.`order_id`,
        y.`purch_id`,
        CAST(y.`notes` AS CHAR CHARACTER SET utf8) AS `notes`
    FROM `pymtfyear` y
    LEFT JOIN `supplier` s ON s.`id` = y.`supplier`
    WHERE
        y.`pymt_for` = 'Purchase'
) x WHERE (x.`party/supplier` LIKE 'search' OR x.`payment` LIKE 'search' OR x.`cash` LIKE 'search' OR x.`bank` LIKE 'search')
ORDER BY x.`pymt_date` DESC, x.`id` DESC LIMIT 300;

SELECT
    e.`id`,
    DATE_FORMAT(e.`date`, '%d/%m/%Y') AS `date`,
    e.`amount`,
    e.`description`,
    e.`pymt_mode` AS `via`,
    e.`bank_mode` AS `mode`,
    py.`method`,
    b.`bank_name` AS `bank`,
    e.`exp_type` AS `type`,
    SUM(e.`amount`) OVER ( PARTITION BY MONTH(e.date) ORDER BY `date`, `id` ) AS `total` 
FROM `expense` e
    LEFT JOIN `bank` b ON b.`id` = e.`bank_id`
    LEFT JOIN `users` u ON u.`id` = e.`user_id`
    LEFT JOIN `pymt_methods` py ON e.`pymt_method` = py.`id`
WHERE
    YEAR(e.`date`) = YEAR(CURDATE())
ORDER BY e.`date` DESC, e.`id` asc;
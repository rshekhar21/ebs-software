SELECT
    DATE_FORMAT(y.`pymt_date`, '%d-%m-%Y') AS `dated`,
    y.`order_id`,
    y.`purch_id`,
    p.`party_name` AS `party`,
    p.`party_id`,
    y.`pymt_for`,
    CASE
        WHEN y.`pymt_for` = 'Sales' THEN 'Credit'
        WHEN y.`pymt_for` = 'Purchase' THEN 'Debit'
        ELSE NULL
    END AS `cr/dr`,
    y.`bank_mode` AS `mode`,
    y.`payment_method` AS `method`,    
    y.`notes`,
    CASE
        WHEN y.`pymt_for` = 'Sales' THEN y.`bank`
        WHEN y.`pymt_for` = 'Purchase' THEN (y.`bank` * -1)
        ELSE NULL
    END AS `amount`
FROM
    `pymtfyear` y
    LEFT JOIN `orders` o ON y.`order_id` = o.`id`
    JOIN `party` p ON y.`party` = p.id
WHERE
    y.`bank_id` = ? 
    AND YEAR(y.`pymt_date`) = ?
    AND MONTH(y.`pymt_date`) = ?
UNION ALL
SELECT
    DATE_FORMAT(e.`date`, '%d-%m-%Y') AS `dated`,
    null as `order_id`,
    null as `purch_id`,
    'N/A' AS `party`,
    null as `party_id`,
    'Expense' AS `pymt_for`,
    'Debit' AS `cr/dr`,
    e.`bank_mode` AS `mode`,
    m.`method` AS `method`,
    e.`description` AS `notes`,
    (e.`amount` * -1) AS `amount`
FROM
    `expense` e
    JOIN `bank` b ON b.id = e.bank_id
    JOIN `pymt_methods` m ON m.id = e.`pymt_method`
WHERE
    e.`bank_id` IS NOT NULL 
    AND e.`bank_id` = ?  
    AND YEAR(e.`date`) = ?
    AND MONTH(e.`date`) = ?
ORDER BY `dated`, `order_id` ASC;
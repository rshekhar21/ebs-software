SELECT 
    o.`id`,
    DATE_FORMAT(o.`timestamp`, '%d-%m-%Y - %r') as `dated`,
    o.`order_type`,
    o.`party`,
    p.`party_name`,
    p.`party_id`,
    o.`inv_number`,
    o.`subtotal`,
    o.`discount`,
    o.`freight`,
    o.`totaltax`,
    o.`round_off`,
    o.`previous_due`,
    o.`alltotal`,
    y.`payment`, 
    y.`cash`, 
    y.`bank`,
    l.`qty_plus`,
    l.`qty_minus`,
    y.`pymt_entries`, 
    o.`gst_type`,
    o.`tax_type`,
    l.`purchase` as `sold_value`,
    l.`returns`,
    o.`rewards`,
    o.`redeem`,
    o.`fin_year`,
    o.`category`,
    o.`location`,
    o.`notes`,
    o.`order_id`,
    u.`username` as `biller`,
    o.`order_date`,
    o.`timestamp`
FROM `orders` o 
LEFT JOIN (
    SELECT `order_id`, count(`order_id`) `pymt_entries`, sum(`amount`) `payment`, sum(`cash`) as `cash`, sum(`bank`) as `bank` FROM `pymtfyear` GROUP BY order_id
    ) y on y.`order_id` = o.`id`
JOIN `party` p ON p.id = o.`party`
JOIN (
    SELECT `order_id`, 
        SUM(CASE WHEN `qty` > 0 THEN `qty` ELSE 0 END) AS `qty_plus`,
        SUM(CASE WHEN `qty` < 0 THEN ABS(`qty`) ELSE 0 END) AS `qty_minus`,
        SUM(CASE WHEN `qty` > 0 THEN `gross` ELSE 0 END) AS `purchase`,
        SUM(CASE WHEN `qty` < 0 THEN ABS(`gross`) ELSE 0 END) AS `returns`
    FROM `sold` GROUP BY `order_id`
) l ON l.`order_id` = o.`id`
JOIN `users` u ON u.`id` = o.`user_id`
WHERE o.`id` = ?
ORDER BY o.`order_date` DESC;
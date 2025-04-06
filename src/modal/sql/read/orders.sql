SELECT
    o.`id`,
    DATE_FORMAT(o.`order_date`, '%d/%m/%Y') AS `dated`,
    DATE_FORMAT(o.`order_date`, '%Y-%m-%d') AS `order_date`,
    p.`party_name`,
    o.`party`,
    p.`party_id`,
    o.`inv_number`,
    o.`order_type`,
    qs.`qty_sold` AS `qty`,
    o.`subtotal`,
    o.`discount`,
    o.`totaltax` AS `tax`,
    o.`manual_tax`,
    o.`freight`,
    o.`alltotal` AS `total`,
    o.`previous_due`,
    py.`pymt`,
    o.`adjustment`,
    o.`round_off`,
    o.`alltotal` - ( COALESCE(py.`pymt`, 0) + COALESCE(o.`adjustment`, 0) ) AS `balance`,
    o.`fin_year`,
    o.`category`,
    o.`location`,
    o.`disc_id`,
    o.`disc_percent`,
    o.`rewards`,
    o.`redeem`,
    o.`notes`,
    o.`ship_id`,
    o.`tax_type`,
    o.`gst_type`,
    MONTH(o.`order_date`) AS `month`,
    YEAR(o.`order_date`) AS `year`,
    u.`username` AS `biller`,
    o.`order_id`,
    o.`timestamp`,
    o.`order_id`,
    p.`email`
FROM
    `orders` o
    LEFT JOIN `party` p ON o.`party` = p.`id`
    LEFT JOIN (
        SELECT `order_id`, SUM(`qty`) as `qty_sold`
        FROM `sold`
        GROUP BY
            `order_id`
    ) qs ON qs.`order_id` = o.`id`
    LEFT JOIN (
        SELECT sum(`amount`) `pymt`, `order_id`
        FROM `payments`
        GROUP BY
            `order_id`
    ) py ON o.`id` = py.`order_id`
    LEFT JOIN `users` u ON o.`user_id` = u.`id`
ORDER BY o.`order_date` DESC, o.`id` DESC;
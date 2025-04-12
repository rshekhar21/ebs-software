SELECT *
FROM (
    SELECT
        o.`id`,
        DATE_FORMAT(`order_date`, '%d-%m-%Y') AS `dated`,
        'Order' AS type,
        o.`subtotal`,
        o.`discount`,
        o.`freight`,
        o.`totaltax` AS `tax`,
        o.`alltotal` AS `total`,
        o.`previous_due` as `clear`,
        y.`payment`,
        o.`alltotal` - COALESCE(y.`payment`, 0) AS `balance`,
        DATE_FORMAT(o.`timestamp`, '%r') as `timestamp`
    FROM `orders` o
    LEFT JOIN (
        SELECT `order_id`, SUM(`amount`) AS `payment`
        FROM `pymtfyear`
        GROUP BY `order_id`
    ) y ON y.`order_id` = o.`id`
    WHERE o.`party` = ?
      AND o.`order_date` >= ? -- Add date filter for orders
      AND o.`order_date` <= ? -- Add date filter for orders

    UNION ALL

    SELECT
        `id`,
        DATE_FORMAT(`pymt_date`, '%d-%m-%Y') AS `dated`,
        'Payment' AS type,
        NULL AS `subtotal`,
        `adjustment` AS `discount`,
        NULL AS `freight`,
        NULL AS `tax`,
        NULL AS `total`,
        null as `clear`,
        `amount` AS `payment`,
        null as `balance`,
        DATE_FORMAT(`timestamp`, '%r') as `timestamp`
    FROM `pymtfyear`
    WHERE `party` = ?
      AND `order_id` IS NULL
      AND `pymt_date` >= ? -- Add date filter for payments
      AND `pymt_date` <= ? -- Add date filter for payments
) x
ORDER BY x.`dated` ASC;
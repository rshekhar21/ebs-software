SELECT
    l.`id`,
    date_format(o.`order_date`, '%d/%m/%Y') AS `sold_on`,
    o.`id` AS `order_id`,
    o.`inv_number` AS `inv`,
    p.`party_name` AS `party`,
    l.`sku`,
    l.`product`,
    l.`pcode`,
    COALESCE(l.`hsn`, s.`hsn`) AS `hsn`,
    l.`qty`,
    l.`mrp` AS `rate`,
    l.`disc`,
    l.`disc_val` AS `dsic#`,
    l.`disc_per` AS `disc%`,
    l.`gst`,
    l.`tax`,
    l.`net`,
    l.`gross`,
    l.`emp_id` AS `emp`,
    e.`emp_name` AS `name`
FROM
    `sold` l
    LEFT JOIN `orders` o ON l.`order_id` = o.`id`
    LEFT JOIN `party` p ON o.`party` = p.`id`
    LEFT JOIN `stock` s ON l.`sku` = s.`sku`
    LEFT JOIN `employee` e ON e.`id` = l.`emp_id`
WHERE
    l.`qty` < 0
ORDER BY o.`id` DESC;
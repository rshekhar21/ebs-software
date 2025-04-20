SELECT
    l.`id`,
    date_format(o.`order_date`, '%d-%m-%Y') AS `dated`,
    l.`order_id`,
    o.`inv_number`,
    p.`party_name`,
    l.`sku`,
    COALESCE(l.`hsn`, s.`hsn`) AS `hsn`,
    COALESCE(l.`category`, s.`category`) AS `category`,
    l.`pcode`,
    l.`product`,
    l.`size`,
    l.`unit`,
    l.`qty`,
    l.`price`,
    l.`disc`,
    l.`disc_val`,
    l.`disc_per`,
    l.`gst`,
    l.`tax`,
    l.`net`,
    l.`gross`,
    l.`emp_id`,
    e.`emp_name`,
    o.`order_id` as `orderid`
FROM `sold` l
    LEFT JOIN `orders` o ON l.`order_id` = o.`id`
    LEFT JOIN `party` p ON o.`party` = p.`id`
    LEFT JOIN `stock` s ON l.`sku` = s.`sku`
    LEFT JOIN `employee` e ON e.`id` = l.`emp_id`
ORDER BY o.`id` DESC, l.`id` ASC LIMIT 300;
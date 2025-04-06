SELECT
    o.`order_id`,
    o.`order_date`,
    DATE_FORMAT(o.`order_date`, '%d-%m-%Y') AS `bill_date`,
    o.`order_type`,
    o.`bill_type`,
    o.`inv_number`,
    o.`subtotal`,
    o.`discount`,
    o.`totaltax`,
    o.`manual_tax`,
    o.`freight`,
    o.`round_off`,
    o.`alltotal`,
    o.`gst_type`,
    o.`tax_type`,
    o.`fin_year`,
    o.`adjustment`,
    o.`ship_id`,
    o.`notes`,
    p.`party_id`,
    p.`party_type`,
    p.`title`,
    p.`party_name`,
    p.`contact`,
    p.`email`,
    p.`company`,
    p.`pan_num`,
    p.`gst_number`,
    p.`aadhaar`,
    p.`address`,
    p.`city`,
    p.`pincode`,
    p.`state`,
    p.`state_code`,
    p.`country`,
    a.`address` as `ship_address`,
    a.`city` as `ship_city`,
    a.`pincode` as `ship_pincode`,
    a.`state` as `ship_state`,
    y.`pymt`,
    y.`forfiet`
FROM
    `orders` o
    JOIN `party` p ON o.`party` = p.`id`
    LEFT JOIN `address` a ON o.`ship_id` = a.`id`
    LEFT JOIN (
        SELECT
            `order_id`,
            sum(`amount`) as `pymt`,
            sum(`adjustment`) as `forfiet`
        FROM `payments`
        WHERE
            `order_id` = ?
        GROUP BY
            `order_id`
    ) y ON y.`order_id` = o.`id`
WHERE
    o.`id` = ?;
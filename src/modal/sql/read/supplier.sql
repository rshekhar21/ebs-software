SELECT
    p.`id`,
    p.`title`,
    p.`sup_id`,
    p.`supplier_name` AS `supplier`,
    p.`contact`,
    p.`email`,
    p.`gst_number`,
    p.`address`,
    p.`city`,
    p.`pincode`,
    p.`state`,
    p.`state_code`,
    p.`country`,
    p.`opening_bal` AS `opening`,
    o.`cnt` AS `orders`,
    o.`purchase` AS `billing`,
    COALESCE(y.`payments`, 0) AS `payments`,
    (
        COALESCE(o.`purchase`, 0) - COALESCE(y.`payments`, 0)
    ) + COALESCE(p.`opening_bal`, 0) AS `balance`
FROM `supplier` p
    LEFT JOIN (
        SELECT count(`supid`) `cnt`, sum(`bill_amount`) `purchase`, `supid`
        FROM `purchase`
        GROUP BY
            `supid`
    ) o ON o.`supid` = p.`id`
    LEFT JOIN (
        SELECT x.`supplier`, sum(x.`amount`) `payments`
        FROM `pymtfyear` x
            JOIN `supplier` p ON x.`supplier` = p.`id`        
        GROUP BY
            x.`supplier`
    ) y ON y.`supplier` = p.id
ORDER BY p.`id` DESC;
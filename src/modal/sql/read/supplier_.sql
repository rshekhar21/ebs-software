SELECT
    p.`id`,
    p.`title`,
    p.`party_id` AS `sup_id`,
    p.`party_name` AS `supplier`,
    p.`party_type`,
    p.`contact`,
    p.`email`,
    p.`pan_num`,
    p.`gst_number`,
    p.`address`,
    p.`city`,
    p.`pincode`,
    p.`state`,
    p.`state_code`,
    p.`country`,
    p.`opening_cr` AS `opening`,
    o.`cnt` AS `orders`,
    o.`purchase` AS `billing`,
    COALESCE(y.`payments`, 0) AS `payments`,
    (
        COALESCE(o.`purchase`, 0) - COALESCE(y.`payments`, 0)
    ) + COALESCE(p.`opening_cr`, 0) AS `balance`
FROM `party` p
    LEFT JOIN (
        SELECT count(`supid`) `cnt`, sum(`bill_amount`) `purchase`, `supid`
        FROM `purchase`
        GROUP BY
            `supid`
    ) o ON o.`supid` = p.`id`
    LEFT JOIN (
        SELECT x.`party`, sum(x.`amount`) `payments`
        FROM `pymtfyear` x
            JOIN `party` p ON x.`party` = p.`id`
        WHERE
            p.`party_type` = 'supplier'
        GROUP BY
            x.`party`
    ) y ON y.`party` = p.id
WHERE
    p.`party_type` = 'supplier'
ORDER BY p.`id` DESC;
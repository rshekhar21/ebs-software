SELECT
    p.`id`,
    p.`title`,
    p.`party_id`,
    p.`party_name`,
    p.`party_type`,
    p.`contact`,
    p.`email`,
    p.`company`,
    p.`gender`,
    p.`pan_num`,
    p.`gst_number`,
    p.`birthday`,
    p.`address`,
    p.`city`,
    p.`pincode`,
    p.`state`,
    p.`state_code`,
    p.`country`,
    p.`opening_bal` AS `opening`,
    p.`rewards`,
    p.`reward_percent`,
    p.`enable_rewards`,
    p.`comments`,
    o.`cnt` AS `orders`,
    o.`billing`,
    y.`payments`,
    (
        COALESCE(o.`billing`, 0) - COALESCE(y.`payments`, 0)
    ) + COALESCE(p.`opening_bal`, 0) AS `balance`
FROM `party` p
    LEFT JOIN (
        SELECT count(`party`) `cnt`, sum(`alltotal`) `billing`, `party`
        FROM `orders`
        GROUP BY
            `party`
    ) o ON o.`party` = p.`id`
    LEFT JOIN (
        SELECT x.`party`, sum(x.`amount`) `payments`
        FROM `pymtfyear` x
            INNER JOIN `party` p ON x.`party` = p.`id`
        WHERE
            p.`party_type` <> 'supplier'
        GROUP BY
            x.`party`
    ) y ON y.`party` = p.id
WHERE
    p.`party_type` <> 'supplier'
ORDER BY p.`id` ASC;
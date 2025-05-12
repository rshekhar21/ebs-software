SELECT
    p.`id`,
    p.`party_id`,
    p.`title`,
    p.`party_name`,
    p.`party_type`,
    p.`contact`,
    p.`email`,
    p.`company`,
    p.`gender`,
    p.`address`,
    p.`city`,
    p.`pincode`,
    p.`state`,
    p.`state_code`,
    p.`country`,
    p.`pan_num`,
    p.`gst_number`,
    p.`birthday`,
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
        SELECT `party`, sum(`amount`) as `payments`
        FROM `pymtfyear`GROUP BY `party`) y ON y.`party` = p.`id`
ORDER BY p.`id` DESC;
WITH date_vars AS (
    SELECT ? AS specific_date  -- Specify your desired date here
)
SELECT
    x.`id`,
    x.`inv`,
    p.`party_name` AS `party`,
    p.`id` AS `party_id`,
    x.`alltotal` AS `total`,
    x.`sold`,
    x.`return`,
    x.`ws`,
    x.`disc`,
    x.`tax`,
    x.`qty`,
    x.`gr`,
    x.`payment` AS `pymt`,
    x.`cash`,
    x.`bank`,
    x.`freight`,
    x.`entry` AS `type`,
    x.`orderid`
FROM (
    SELECT
        o.`id`,
        o.`id` AS `order_id`,
        NULL AS `purch_id`,
        o.`order_date` AS `date`,
        o.`party`,
        o.`inv_number` AS `inv`,
        o.`subtotal`,
        q.`sold`,
        g.`return`,
        `ws`.`ws`,
        o.`discount` AS `disc`,
        o.`totaltax` AS `tax`,
        q.`qty`,
        g.`gr`,
        o.`freight`,
        o.`alltotal`,
        p.`payment`,
        p.`cash`,
        p.`bank`,
        'Sale' AS `entry`,
        NULL AS `pymt_for`,
        o.`entity`,
        o.`order_id` as `orderid`
    FROM
        `orders` o
        LEFT JOIN (
            SELECT
                y.`order_id`,
                o.`order_date`,
                SUM(y.`amount`) AS `payment`,
                SUM(y.`cash`) AS `cash`,
                SUM(y.`bank`) AS `bank`,
                SUM(y.`other`) AS `other`
            FROM `pymtfyear` y
            JOIN `orders` o ON y.`order_id` = o.`id`
            WHERE
                y.`pymt_for` = 'Sales'
                AND o.`order_date` = (SELECT specific_date FROM date_vars)  -- Use date from date_vars CTE
            GROUP BY
                y.`order_id`, o.`order_date`
        ) p ON o.`id` = p.`order_id`
        LEFT JOIN (
            SELECT
                SUM(`qty`) AS `qty`,
                SUM(`gross`) AS `sold`,
                o.`order_id`
            FROM `sold` l join orders o on l.order_id = o.id
            WHERE
                `qty` > 0 AND o.order_date = (SELECT specific_date FROM date_vars)
            GROUP BY
                o.`order_id`
        ) q ON q.`order_id` = o.`id`
        LEFT JOIN (
            SELECT
                SUM(`qty`) AS `gr`,
                SUM(`gross`) AS `return`,
                o.`order_id`
            FROM `sold` l JOIN orders o ON l.order_id = o.id
            WHERE
                `qty` < 0 AND o.order_date = (SELECT specific_date FROM date_vars)
            GROUP BY
                o.`order_id`
        ) g ON g.`order_id` = o.`id`
        LEFT JOIN (
            SELECT
                l.`order_id`,
                SUM(l.`gross`) AS `ws`,
                SUM(l.`qty`) AS `ws_qty`
            FROM `sold` l
            LEFT JOIN `orders` o ON l.`order_id` = o.`id`
            WHERE
                o.`category` = 'WS' AND o.order_date = (SELECT specific_date FROM date_vars)
            GROUP BY
                o.`order_id`
        ) `ws` ON `ws`.`order_id` = o.`id`
    WHERE
        o.`order_date` = (SELECT specific_date FROM date_vars)  -- Use date from date_vars CTE
    UNION
    SELECT
        p.`id`,
        p.`order_id`,
        p.`purch_id`,
        p.`pymt_date` AS `date`,
        p.`party`,
        NULL AS `inv_no`,
        NULL AS `subtotal`,
        NULL AS `purch`,
        NULL AS `return`,
        NULL AS 'WS',
        p.`adjustment` AS `disc`,
        NULL AS `tax`,
        NULL AS `sold`,
        NULL AS `gr`,
        NULL AS `freight`,
        NULL AS `alltotal`,
        p.`amount` AS `payment`,
        p.`cash`,
        p.`bank`,
        'Pymt' AS `entry`,
        p.`pymt_for`,
        p.`entity`,
        null as `orderid`
    FROM `pymtfyear` p
    LEFT JOIN (
        SELECT `id`, `order_date`
        FROM `orders`
        GROUP BY `id`, `order_date`
    ) o ON o.`id` = p.`order_id`
    WHERE
        p.`pymt_for` = 'Sales'
        AND (o.`order_date` IS NULL OR o.`order_date` < (SELECT specific_date FROM date_vars))  -- Use date from date_vars CTE
) x
LEFT JOIN `party` p ON x.`party` = p.`id`
LEFT JOIN (
    SELECT
        p.`id`,
        COALESCE(p.`opening_bal`, 0) + COALESCE(o.`total`, 0) - (
            COALESCE(y.`payments`, 0) + COALESCE(y.`adj`, 0)
        ) AS `new_bal`
    FROM `party` p
    LEFT JOIN (
        SELECT
            `party`,
            SUM(`alltotal`) `total`
        FROM `orders`
        WHERE
            `order_date` <= (SELECT specific_date FROM date_vars)  -- Use date from date_vars CTE
        GROUP BY
            `party`
    ) o ON o.`party` = p.`id`
    LEFT JOIN (
        SELECT
            `party`,
            SUM(`amount`) `payments`,
            SUM(`adjustment`) `adj`
        FROM `pymtfyear`
        WHERE
            `pymt_for` = 'Sales'
            AND `pymt_date` <= (SELECT specific_date FROM date_vars)  -- Use date from date_vars CTE
        GROUP BY
            `party`
    ) y ON y.`party` = p.`id`
) y ON x.`party` = y.`id`
LEFT JOIN (
    SELECT
        p.`id`,
        COALESCE(p.`opening_bal`, 0) + COALESCE(o.`total`, 0) - (
            COALESCE(y.`payments`, 0) + COALESCE(y.`adj`, 0)
        ) AS `old_bal`
    FROM `party` p
    LEFT JOIN (
        SELECT
            `party`,
            SUM(`alltotal`) `total`
        FROM `orders`
        WHERE
            `order_date` < (SELECT specific_date FROM date_vars)  -- Use date from date_vars CTE
        GROUP BY
            `party`
    ) o ON o.`party` = p.`id`
    LEFT JOIN (
        SELECT
            `party`,
            SUM(`amount`) `payments`,
            SUM(COALESCE(`adjustment`, 0)) `adj`
        FROM `pymtfyear`
        WHERE
            `pymt_for` = 'Sales'
            AND `pymt_date` < (SELECT specific_date FROM date_vars)  -- Use date from date_vars CTE
        GROUP BY
            `party`
    ) y ON y.`party` = p.`id`
) z ON x.`party` = z.`id`
WHERE
    x.`purch_id` IS NULL
    AND x.`date` = (SELECT specific_date FROM date_vars)  -- Use date from date_vars CTE
    AND x.`entity` = 1 ORDER BY x.`id`;

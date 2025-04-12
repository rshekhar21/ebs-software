WITH
    params AS (
        SELECT ? AS date_val
    ),
    pymtf_p AS (
        SELECT
            y.`order_id`,
            o.`order_date`,
            SUM(y.`amount`) AS `payment`,
            SUM(y.`cash`) AS `cash`,
            SUM(y.`bank`) AS `bank`,
            SUM(y.`other`) AS `other`
        FROM
            `pymtfyear` y
            JOIN `orders` o ON y.`order_id` = o.`id`
            CROSS JOIN params
        WHERE
            y.`pymt_for` = 'Sales'
            -- y.`order_id` is not null
            AND o.`order_date` = params.date_val
        GROUP BY
            y.`order_id`,
            o.`order_date`
    ),
    sold_positive AS (
        SELECT SUM(`qty`) AS `qty`, SUM(`gross`) AS `sold`, `order_id`
        FROM `sold`
        WHERE
            `qty` > 0
        GROUP BY
            `order_id`
    ),
    sold_negative AS (
        SELECT SUM(`qty`) AS `gr`, SUM(`gross`) AS `return`, `order_id`
        FROM `sold`
        WHERE
            `qty` < 0
        GROUP BY
            `order_id`
    ),
    ws_table AS (
        SELECT l.`order_id`, SUM(l.`gross`) AS `ws`, SUM(l.`qty`) AS `ws_qty`
        FROM `sold` l
            JOIN `orders` o ON l.`order_id` = o.`id`
            CROSS JOIN params
        WHERE
            o.`category` = 'WS'
        GROUP BY
            o.`order_id`
    ),
    union_sales_pymt AS (
        SELECT
            o.`id`,
            o.`id` AS `order_id`,
            NULL AS `purch_id`,
            o.`order_date` AS `date`,
            o.`party`,
            o.`inv_number` AS `inv`,
            o.`previous_due`,
            o.`subtotal`,
            q.`sold`,
            g.`return`,
            ws.`ws`,
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
            o.order_id AS `orderid`,
            o.`timestamp`
        FROM
            `orders` o
            LEFT JOIN pymtf_p p ON o.`id` = p.`order_id`
            LEFT JOIN sold_positive q ON q.`order_id` = o.`id`
            LEFT JOIN sold_negative g ON g.`order_id` = o.`id`
            LEFT JOIN ws_table ws ON ws.`order_id` = o.`id`
        WHERE
            o.`order_date` = (
                SELECT date_val
                FROM params
            )
        UNION
        SELECT
            p.`id`,
            p.`order_id`,
            p.`purch_id`,
            p.`pymt_date` AS `date`,
            p.`party`,
            NULL AS `inv`,
            NULL AS `previous_due`,
            NULL AS `subtotal`,
            NULL AS `purch`,
            NULL AS `return`,
            NULL AS `WS`,
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
            NULL AS `orderid`,
            p.`timestamp`
        FROM `pymtfyear` p
            LEFT JOIN (
                SELECT `id`, `order_date`
                FROM `orders`
                GROUP BY
                    `id`, `order_date`
            ) o ON o.`id` = p.`order_id`
            CROSS JOIN params
        WHERE
            p.`pymt_for` = 'Sales'
            AND (
                o.`order_date` IS NULL
                OR o.`order_date` < (
                    SELECT date_val
                    FROM params
                )
            )
    ),
    x AS (
        SELECT *
        FROM union_sales_pymt
    ),
    new_bal AS (
        SELECT p.`id`, COALESCE(p.`opening_bal`, 0) + COALESCE(o.`total`, 0) - (
                COALESCE(y.`payments`, 0) + COALESCE(y.`adj`, 0)
            ) AS `new_bal`
        FROM `party` p
            LEFT JOIN (
                SELECT `party`, SUM(`alltotal`) AS `total`
                FROM `orders`
                WHERE
                    `order_date` <= (
                        SELECT date_val
                        FROM params
                    )
                GROUP BY
                    `party`
            ) o ON o.`party` = p.`id`
            LEFT JOIN (
                SELECT `party`, SUM(`amount`) AS `payments`, SUM(`adjustment`) AS `adj`
                FROM `pymtfyear`
                WHERE
                    `pymt_for` = 'Sales'
                    AND `pymt_date` <= (
                        SELECT date_val
                        FROM params
                    )
                GROUP BY
                    `party`
            ) y ON y.`party` = p.`id`
    ),
    old_bal AS (
        SELECT p.`id`, COALESCE(p.`opening_bal`, 0) + COALESCE(o.`total`, 0) - (
                COALESCE(y.`payments`, 0) + COALESCE(y.`adj`, 0)
            ) AS `old_bal`
        FROM `party` p
            LEFT JOIN (
                SELECT `party`, SUM(`alltotal`) AS `total`
                FROM `orders`
                WHERE
                    `order_date` < (
                        SELECT date_val
                        FROM params
                    )
                GROUP BY
                    `party`
            ) o ON o.`party` = p.`id`
            LEFT JOIN (
                SELECT `party`, SUM(`amount`) AS `payments`, SUM(COALESCE(`adjustment`, 0)) AS `adj`
                FROM `pymtfyear`
                WHERE
                    `pymt_for` = 'Sales'
                    AND `pymt_date` < (
                        SELECT date_val
                        FROM params
                    )
                GROUP BY
                    `party`
            ) y ON y.`party` = p.`id`
    )
SELECT
    x.`id`,
    x.`inv`,
    p.`party_name` AS `party`,
    p.`id` AS `party_id`,
    p.`party_id` as `mem_id`,
    -- Uncomment and use if needed
    -- z.`old_bal` AS `ob`,
    x.`qty`,
    x.`alltotal` AS `total`,
    x.`sold`,
    x.`return` AS `return`,
    x.ws,
    x.`disc`,
    x.`tax`,
    x.`gr`,
    x.`previous_due` as `pre_adj`,
    x.`payment` AS `pymt`,
    x.`cash`,
    x.`bank`,
    x.`freight`,
    -- y.`new_bal` AS `nb`,
    x.`entry` AS `type`,
    x.`orderid`,
    DATE_FORMAT(x.`timestamp`, '%r') AS `timestamp`
FROM
    x
    LEFT JOIN `party` p ON x.`party` = p.`id`
    LEFT JOIN new_bal y ON x.`party` = y.`id`
    LEFT JOIN old_bal z ON x.`party` = z.`id`
WHERE
    x.`purch_id` IS NULL
    AND x.`date` = (
        SELECT date_val
        FROM params
    )
    AND x.`entity` = 1
ORDER BY x.`id` ASC;
CREATE OR REPLACE VIEW `viewstock` AS
SELECT
    s.*,
    DATE_FORMAT(
        COALESCE(u.`bill_date`, u.`order_date`),
        '%d/%m/%Y'
    ) AS `prchd_on`,
    u.`bill_number`,
    u.`supid`,
    p.`party_name` as `supplier`,
    l.`sold`,
    r.`returned`,
    ds.`defect`,
    (
        s.`qty` - COALESCE(r.`returned`, 0) - COALESCE(l.`sold`, 0)
    ) AS `available`
FROM
    `stock` s
    LEFT JOIN `purchase` u ON u.`id` = s.`purch_id`
    LEFT JOIN `party` p ON p.`id` = u.`supid`
    LEFT JOIN (
        SELECT `sku`, SUM(`qty`) AS `sold`
        FROM `sold`
        GROUP BY
            `sku`
    ) l ON l.`sku` = s.`sku`
    LEFT JOIN (
        SELECT `sku`, SUM(`qty`) AS `returned`
        FROM `stockreturn`
        GROUP BY
            `sku`
    ) r ON r.`sku` = s.`sku`
    LEFT JOIN (
        SELECT `sku`, SUM(`qty`) as `defect`
        FROM `defective_stock`
        WHERE
            `dnote_id` IS NULL
        GROUP BY
            `sku`
    ) ds on ds.`sku` = s.`sku`
ORDER BY s.`id` ASC;

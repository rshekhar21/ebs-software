-- Active: 1728019028452@@ebsserver.in@3306@db_rajimpex
SELECT
    `id`,
    DATE_FORMAT(`bill_date`, '%d-%m-%Y') AS `dated`,
    `fin_year` as `fy`,
    `bill_number` as `bill_no`,
    `bill_type`,
    `quantity` as `qty`,
    `subtotal`,
    `discount`,
    `tax`,
    `roundoff` as `round`,
    `freight`,
    `total`,
    `payment`,
    DATE_FORMAT(`timestamp`, '%r') as `time`
FROM (
        SELECT
            `id`, `bill_date`, `bill_number`, `bill_type`, `sub_total` AS `subtotal`, `discount`, `tax_amount` AS `tax`, `gst_roundoff` AS `roundoff`, `freight`, `bill_amount` AS `total`, NULL AS `payment`, `quantity`, `fin_year`, `timestamp`
        FROM `purchase` u
            JOIN (
                select `purch_id`, sum(`amount`) AS `payment`
                FROM `pymtfyear`
                GROUP BY
                    `purch_id`
            ) y on y.`purch_id` = u.`id`
        WHERE
            `purch_id` IS NOT NULL
            AND `supid` = 1
        UNION
        SELECT
            `id`, `pymt_date` AS `bill_date`, NULL AS `bill_number`, 'Payment' AS `bill_type`, NULL AS `subtotal`, NULL AS `dIScount`, NULL AS `tax`, NULL AS `roundoff`, NULL AS `freight`, NULL AS `total`, `amount` AS `payment`, NULL AS `quantity`, `fin_year`, `timestamp`
        FROM `pymtfyear`
        WHERE
            `purch_id` is NULL
            AND `pymt_for` = 'Purchase'
            AND `supplier` = 1
    ) x
ORDER BY x.`bill_date` DESC;
-- Active: 1728019028452@@ebsserver.in@3306@db_demo
SELECT
    `id`,
    DATE_FORMAT(`dated`, '%d/%m/%Y') AS `dated`,
    `order_number`,
    `supplier`,
    `bill_type`,
    `bill_number`,
    `qty`,
    `subtotal`,
    `disc`,
    `tax`,
    `freight`,
    `total`,
    `pymt`,
    `total` - COALESCE(`pymt`, 0) AS `balance`,
    `fyear`,
    `supid`,
    `bdate`
FROM (
        SELECT
            u.`id`, u.`order_number`, COALESCE(u.`bill_date`, u.`order_date`) AS `dated`, p.`supplier_name` AS `supplier`, u.`supid`, u.`bill_type`, u.`bill_number`, u.`quantity` AS `qty`, u.`sub_total` AS `subtotal`, u.`discount` AS `disc`, u.`tax_amount` AS `tax`, u.`freight`, u.`bill_amount` AS `total`, y.`pymt`, u.`fin_year` AS `fyear`, u.`ref_filename`, COALESCE(u.`bill_date`, u.`order_date`) AS `bdate`
        FROM
            `purchase` u
            LEFT JOIN `supplier` p on p.`id` = u.`supid`
            LEFT JOIN (
                SELECT `purch_id`, sum(`amount`) AS `pymt`
                FROM `pymtfyear`
                WHERE
                    `pymt_for` = 'purchase'
                GROUP BY
                    `purch_id`
            ) y on y.`purch_id` = u.`id`
        WHERE
            u.`entity` = 1
        UNION
        SELECT
            y.`id`, NULL AS `order_number`, y.`pymt_date` AS `dated`, p.`party_name` AS `supplier`, y.`party` AS `supid`, 'payment' AS `bill_type`, NULL AS `bill_number`, NULL AS `qty`, NULL AS `subtotal`, y.`adjustment` AS `disc`, NULL AS `tax`, NULL AS `freight`, NULL AS `total`, y.`amount` AS `pymt`, y.`fin_year` AS `fyear`, NULL AS `ref_filename`, y.`pymt_date` AS `bdate`
        FROM `pymtfyear` y
            LEFT JOIN `supplier` p on p.id = y.`supplier`
        WHERE
            y.`pymt_for` = 'purchase'
            AND y.`purch_id` IS NULL
    ) x
ORDER BY x.`dated` desc, x.`id` DESC;




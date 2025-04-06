-- Active: 1728019028452@@ebsserver.in@3306@gbxecgjdbxwi
SELECT *
FROM (
        SELECT
            p.id, p.`party_name` AS `party`, p.`opening_bal` AS ob, o.`total`, y.`pymt`, (
                COALESCE(o.`total`, 0) + COALESCE(p.`opening_bal`, 0) - COALESCE(y.`pymt`, 0)
            ) AS `balance`
        FROM `party` p
            LEFT JOIN (
                SELECT `party`, SUM(`alltotal`) AS `total`
                FROM `orders`
                GROUP BY
                    `party`
            ) o ON o.`party` = p.id
            LEFT JOIN (
                SELECT `party`, SUM(`amount`) AS `pymt`
                FROM `pymtfyear`
                WHERE
                    `pymt_for` = 'Sales'
                GROUP BY
                    `party`
            ) y ON y.`party` = p.id
        WHERE
            p.`party_type` <> 'supplier'
    ) x
WHERE
    x.`balance` <> '0.00';
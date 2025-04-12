WITH
    date_val AS (
        SELECT ? AS bank_id, ? AS `month`, ? AS `year`
    ),
    bank_statement AS (
        SELECT
            DATE_FORMAT(y.pymt_date, '%d-%m-%Y') AS dated,
            CASE
                WHEN y.pymt_for = 'sales' THEN y.bank
                ELSE ''
            END AS credit,
            CASE
                WHEN y.pymt_for = 'purchase' THEN y.bank
                ELSE ''
            END AS debit,            
            CASE
                WHEN y.pymt_for = 'sales' THEN 'Sale'
                ELSE 'Purchase'
            END AS `description`,
            p.party_name AS party
        FROM
            bank b
            JOIN date_val dv ON dv.bank_id = b.id
            JOIN pymtfyear y ON y.bank_id = b.id
            JOIN party p ON p.id = y.party
        WHERE
            MONTH(y.pymt_date) = dv.month
            AND YEAR(y.pymt_date) = dv.year
        UNION
        SELECT
            DATE_FORMAT(e.`date`, '%d-%m-%Y') AS dated,
            NULL AS credit,
            e.amount AS debit,
            e.`description`,
            NULL AS party
        FROM
            bank b
            JOIN expense e ON e.bank_id = b.id
            JOIN date_val dv ON dv.bank_id = b.id
        WHERE
            MONTH(e.`date`) = dv.month
            AND YEAR(e.`date`) = dv.year
    )
SELECT *
FROM bank_statement
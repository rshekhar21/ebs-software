SELECT
    MONTH(order_date) AS mnth,
    DATE_FORMAT(order_date, '%b') AS short_month,
    SUM(
        CASE
            WHEN fin_year = CASE
                WHEN MONTH(NOW()) > 3 THEN YEAR(NOW()) + 1
                ELSE YEAR(NOW())
            END THEN alltotal
            ELSE 0
        END
    ) AS current_fy,
    SUM(
        CASE
            WHEN fin_year = CASE
                WHEN MONTH(NOW()) > 3 THEN YEAR(NOW())
                ELSE YEAR(NOW()) - 1
            END THEN alltotal
            ELSE 0
        END
    ) AS last_fy
FROM orders
GROUP BY
    MONTH(order_date),
    short_month;
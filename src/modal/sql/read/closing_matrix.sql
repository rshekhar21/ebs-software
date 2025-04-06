WITH
    date_variable AS (
        SELECT ? AS specified_date
    ),
    customer_metrics AS (
        SELECT
            COUNT(
                DISTINCT CASE
                    WHEN p.reg_date = dv.specified_date THEN o.party
                END
            ) AS new_customers,
            COUNT(
                DISTINCT CASE
                    WHEN p.reg_date < dv.specified_date THEN o.party
                END
            ) AS repeat_customers,
            SUM(
                CASE
                    WHEN s.qty > 0 THEN s.qty
                    ELSE 0
                END
            ) AS total_qty_sold,
            SUM(
                CASE
                    WHEN s.qty < 0 THEN - s.qty
                    ELSE 0
                END
            ) AS total_qty_returned
        FROM
            orders o
            JOIN party p ON o.party = p.id
            JOIN sold s ON o.id = s.order_id
            JOIN date_variable dv ON 1 = 1 -- Join with date_variable to access specified_date
        WHERE
            o.order_date = dv.specified_date
    ),
    sales_metrics AS (
        SELECT
            SUM(alltotal) AS sales,
            SUM(totaltax) AS gst,
            SUM(discount) AS disc,
            SUM(freight) AS freight,
            COUNT(*) AS orders,
            MAX(alltotal) AS highest_order,
            SUM(
                CASE
                    WHEN category IS NOT NULL THEN alltotal
                    ELSE 0
                END
            ) AS wholesale,
            SUM(
                CASE
                    WHEN category IS NULL THEN alltotal
                    ELSE 0
                END
            ) AS retail
        FROM orders
            JOIN date_variable dv ON orders.order_date = dv.specified_date -- Join with date_variable to filter by specified_date
    ),
    payment_metrics AS (
        SELECT
            SUM(amount) AS total_payments,
            SUM(cash) AS cash_payments,
            SUM(bank) AS bank_payments,
            SUM(adjustment) AS forfeited,
            SUM(
                CASE
                    WHEN bank_mode = 'card' THEN bank
                    ELSE 0
                END
            ) AS card_payments,
            SUM(
                CASE
                    WHEN bank_mode = 'online' THEN bank
                    ELSE 0
                END
            ) AS online_payments
        FROM
            pymtfyear y
            JOIN date_variable dv ON y.pymt_date = dv.specified_date
            AND y.pymt_for = 'Sales' -- Join with date_variable to filter by specified_date
    ),
    monthly_sales AS (
        SELECT SUM(alltotal) AS total_monthly_sales
        FROM
            orders
            JOIN date_variable dv ON YEAR(orders.order_date) = YEAR(dv.specified_date)
            AND MONTH(orders.order_date) = MONTH(dv.specified_date) -- Join with date_variable to filter by month and year
    ),
    expense_matrix AS (
        SELECT SUM(amount) AS total_expense
        FROM expense
            JOIN date_variable dv ON expense.date = dv.specified_date -- Join with date_variable to filter by specified_date
    ),
    purch_matrix AS (
        SELECT sum(bill_amount) AS total_purchase
        FROM purchase
            JOIN date_variable dv ON purchase.order_date = dv.specified_date -- Join with date_variable to filter by specified_date
    ),
    supplier_pymt AS (
        SELECT SUM(amount) as supplier_pymt
        FROM pymtfyear y
            JOIN date_variable dv ON y.pymt_date = dv.specified_date
        WHERE
            y.purch_id is not NULL
            OR y.pymt_for = 'Purchase'
    ),
    emp_advance as (
        SELECT SUM(amount) AS emp_advance
        FROM
            emp_advance e
            JOIN date_variable dv on e.pymt_date = dv.specified_date
    ),
    new_stock AS (
        SELECT SUM(qty) as new_stock
        FROM stock s
            JOIN date_variable dv on date_format(s.timestamp, '%Y-%m-%d') = dv.specified_date
    )
SELECT
    cm.new_customers,
    cm.repeat_customers,
    cm.total_qty_sold,
    cm.total_qty_returned,
    sm.sales,
    sm.gst,
    sm.disc,
    sm.freight,
    sm.orders,
    sm.highest_order,
    sm.wholesale,
    sm.retail,
    pm.total_payments,
    pm.bank_payments,
    pm.cash_payments,
    pm.card_payments,
    pm.online_payments,
    pm.forfeited,
    ms.total_monthly_sales,
    em.total_expense,
    um.total_purchase,
    sp.supplier_pymt,
    ea.emp_advance,
    ns.new_stock
FROM
    customer_metrics cm
    CROSS JOIN sales_metrics sm
    CROSS JOIN payment_metrics pm
    CROSS JOIN monthly_sales ms
    CROSS JOIN expense_matrix em
    CROSS JOIN purch_matrix um
    CROSS JOIN supplier_pymt sp
    CROSS JOIN emp_advance ea
    CROSS JOIN new_stock ns;
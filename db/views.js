const views = [
    {
        id: 1,
        name: 'payment',
        sql: "CREATE VIEW pymtfyear AS SELECT y.id, COALESCE(y.party, o.party, u.supid) AS party, COALESCE(y.pymt_date, o.order_date, u.bill_date) AS pymt_date, y.pymt_for, y.order_id, y.purch_id, y.amount, y.cash, y.bank, b.bank_name, y.other, y.bank_mode, y.pymt_method, m.method AS payment_method, y.bank_id, y.txnid, y.adjustment, y.notes, y.entity, y.timestamp, CASE WHEN CAST(strftime('%m', COALESCE(y.pymt_date, o.order_date, u.bill_date)) AS INTEGER) > 3 THEN CAST(strftime('%Y', COALESCE(y.pymt_date, o.order_date, u.bill_date)) AS INTEGER) + 1 ELSE CAST(strftime('%Y', COALESCE(y.pymt_date, o.order_date, u.bill_date)) AS INTEGER) END AS fin_year FROM payments y LEFT JOIN orders o ON y.order_id = o.id LEFT JOIN purchase u ON y.purch_id = u.id LEFT JOIN bank b ON y.bank_id = b.id LEFT JOIN pymt_methods m ON y.pymt_method = m.id;",
    },
    {
        id: 2,
        name: 'stock',
        sql: "CREATE VIEW viewstock AS SELECT s.*, strftime('%d/%m/%Y', COALESCE(u.bill_date, u.order_date)) AS prchd_on, u.bill_number, u.supid, p.party_name AS supplier, l.sold, r.returned, ds.defect, (s.qty - COALESCE(r.returned, 0) - COALESCE(l.sold, 0)) AS available FROM stock s LEFT JOIN purchase u ON u.id = s.purch_id LEFT JOIN party p ON p.id = u.supid LEFT JOIN (SELECT sku, SUM(qty) AS sold FROM sold GROUP BY sku) l ON l.sku = s.sku LEFT JOIN (SELECT sku, SUM(qty) AS returned FROM stockreturn GROUP BY sku) r ON r.sku = s.sku LEFT JOIN (SELECT sku, SUM(qty) AS defect FROM defective_stock WHERE dnote_id IS NULL GROUP BY sku) ds ON ds.sku = s.sku ORDER BY s.id ASC;",

    }
];

module.exports = views;
-- Active: 1744177414628@@ebsserver.in@3306@db_demo
use db_demo;

SELECT 
    DATE_FORMAT(`order_date`, '%d-%m-%Y') as `dated`, 
    p.party_name,
    p.party_id,
    o.subtotal,
    o.discount,
    o.freight,
    o.totaltax,
    o.alltotal,
    y.`pymt_entries`, 
    y.`payment`, 
    y.`cash`, 
    y.`bank` 
FROM `orders` o 
LEFT JOIN (
    SELECT `order_id`, count(`order_id`) `pymt_entries`, sum(`amount`) `payment`, sum(`cash`) as `cash`, sum(`bank`) as `bank` FROM `pymtfyear` GROUP BY order_id
    ) y on y.`order_id` = o.id
JOIN party p ON p.id = o.party
JOIN (
    SELECT order_id, 
        SUM(CASE WHEN qty > 0 THEN qty ELSE 0 END) AS qty_plus,
        SUM(CASE WHEN qty < 0 THEN ABS(qty) ELSE 0 END) AS qty_minus 
    FROM sold GROUP BY order_id
) l ON l.order_id = o.id

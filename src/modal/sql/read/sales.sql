SELECT
    DATE_FORMAT(o.`order_date`, '%d/%m/%Y') AS `dated`,
    SUM(o.`alltotal`) AS `sales`,
    gr.`returns`,
    ws.`ws`,
    ev.`event`,
    SUM(o.`discount`) AS `discount`,
    SUM(o.`totaltax`) AS `gst`,
    SUM(o.`freight`) AS `freight`,
    sl.`net_sale`,
    COUNT(o.`id`) AS `orders`,
    sl.`qty`,
    gr.`gr`,
    p.`pymt`,
    p.`cash`,
    p.`bank`,
    MONTH(o.`order_date`) AS `month`,
    YEAR(o.`order_date`) AS `year`,
    o.`fin_year` AS `fyear`
FROM
    `orders` o
    LEFT JOIN (
        SELECT
            SUM(y.`amount`) AS `pymt`, SUM(y.`cash`) AS `cash`, SUM(y.`bank`) AS `bank`, SUM(y.`other`) AS `other`, o.`order_date`
        FROM `pymtfyear` y
            JOIN `orders` o on o.`id` = y.`order_id`
        WHERE
            o.`entity` = 1
        GROUP BY
            o.`order_date`
    ) p ON p.`order_date` = o.`order_date`
    LEFT JOIN (
        SELECT o.`order_date`, SUM(l.`net`) AS `net_sale`, SUM(l.`qty`) AS `qty`
        FROM `sold` l
            LEFT JOIN `orders` o ON l.`order_id` = o.`id`
        WHERE
            l.`qty` > 0
        GROUP BY
            o.`order_date`
    ) `sl` ON sl.`order_date` = o.`order_date`
    LEFT JOIN (
        SELECT o.`order_date`, SUM(l.`net`) AS `returns`, SUM(l.`qty`) AS `gr`
        FROM `sold` l
            LEFT JOIN `orders` o ON l.`order_id` = o.`id`
        WHERE
            l.`qty` < 0
        GROUP BY
            o.`order_date`
    ) `gr` ON gr.`order_date` = o.`order_date`
    LEFT JOIN (
        SELECT o.`order_date`, SUM(l.`net`) AS `ws`, SUM(l.`qty`) AS `ws_qty`
        FROM `sold` l
            LEFT JOIN `orders` o on l.`order_id` = o.`id`
        WHERE
            o.`category` = 'WS'
        GROUP BY
            o.`order_date`
    ) `ws` ON ws.`order_date` = o.`order_date`
    LEFT JOIN (
        SELECT o.`order_date`, SUM(l.`net`) AS `event`, SUM(l.`qty`) AS `event_qty`
        FROM `sold` l
            LEFT JOIN `orders` o on l.`order_id` = o.`id`
        WHERE
            o.`category` = 'EVENT'
        GROUP BY
            o.`order_date`
    ) `ev` ON ev.`order_date` = o.`order_date`
WHERE
    o.`fin_year` = ?
    AND MONTH(o.`order_date`) = ?
    AND o.`entity` = 1
    AND o.`order_type` NOT IN('estimate', 'gr-est')
GROUP BY
    o.`order_date`,
    o.`fin_year`,
    sl.`net_sale`,
    gr.`returns`,
    sl.`qty`,
    gr.`gr`,
    ws.`ws`,
    ev.`event`,
    p.`pymt`,
    p.`cash`,
    p.`bank`,
    MONTH(o.`order_date`),
    YEAR(o.`order_date`),
    o.`fin_year`
ORDER BY o.`order_date` ASC;
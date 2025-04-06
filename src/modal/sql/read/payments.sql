-- Active: 1728019028452@@myebsserver.in@3306@db_demo
SELECT
    y.`id`,
    date_format(y.`pymt_date`, '%d/%m/%Y') AS `dated`,
    date_format(y.`pymt_date`, '%Y-%m-%d') AS `pymt_date`,
    p.`party_name`,
    p.`id` AS `party`,
    y.`amount`,
    y.`cash`,
    y.`bank`,
    y.`other`,
    y.`bank_id`,
    y.`bank_mode`,
    y.`pymt_method`,
    y.`payment_method`,
    y.`bank_name`,
    y.`adjustment` AS `forefiet`,
    y.`order_id`,
    y.`purch_id`,
    y.`pymt_for`,
    y.`notes`
FROM `pymtfyear` y
    LEFT JOIN `party` p on p.`id` = y.`party`
WHERE y.`entity` = 1
ORDER BY
    y.`pymt_date` DESC, y.`id` DESC;
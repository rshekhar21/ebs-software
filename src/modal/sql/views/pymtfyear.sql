CREATE OR REPLACE VIEW `pymtfyear` AS
SELECT
    y.`id`,
    coalesce( y.`party`, o.`party` ) as `party`,
    coalesce( y.`supplier`, u.`supid` ) as `supplier`,
    coalesce( y.`pymt_date`, o.`order_date`, u.`bill_date` ) as `pymt_date`,
    y.`pymt_for`,
    y.`order_id`,
    y.`purch_id`,
    y.`amount`,
    y.`cash`,
    y.`bank`,
    b.`bank_name`,
    y.`other`,
    y.`bank_mode`,
    y.`pymt_method`,
    m.`method` AS `payment_method`,
    y.`bank_id`,
    y.`txnid`,
    y.`adjustment`,
    y.`notes`,
    y.`entity`,
    y.`timestamp`,
    IF(
        MONTH(
            COALESCE(
                y.`pymt_date`, o.`order_date`, u.`bill_date`
            )
        ) > 3, YEAR(
            COALESCE(
                y.`pymt_date`, o.`order_date`, u.`bill_date`
            )
        ) + 1, YEAR(
            COALESCE(
                y.`pymt_date`, o.`order_date`, u.`bill_date`
            )
        )
    ) AS `fin_year`
FROM
    `payments` y
    LEFT JOIN `orders` o ON y.`order_id` = o.`id`
    LEFT JOIN `purchase` u ON y.`purch_id` = u.`id`
    LEFT JOIN `bank` b ON y.`bank_id` = b.`id`
    LEFT JOIN `pymt_methods` m ON y.`pymt_method` = m.`id`;
SELECT 
    day_num.day AS day,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 4 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `apr`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 5 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `may`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 6 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `jun`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 7 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `jul`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 8 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `aug`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 9 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `sep`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 10 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `oct`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 11 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `nov`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 12 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `dec`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 1 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `jan`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 2 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `feb`,
    COALESCE(SUM(CASE WHEN MONTH(`order_date`) = 3 AND `fin_year` = ? THEN `alltotal` ELSE 0 END), 0) AS `mar`
FROM 
    (SELECT 1 AS day UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL 
     SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL 
     SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL 
     SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL 
     SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25 UNION ALL 
     SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30 UNION ALL 
     SELECT 31) AS `day_num`
LEFT JOIN `orders` ON day_num.day = DAY(`order_date`)
WHERE `fin_year` = ?
GROUP BY day_num.day
ORDER BY day_num.day;
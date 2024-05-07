SELECT
    count(id),
    hour_am_pm
FROM
    (
        SELECT
            leads.id,
            DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
        FROM
            leads
            INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
        WHERE
            communication_mode = 'call'
            AND sakanisv2.broker_company_name = 'McCone Properties'
            AND sakanisv2.purpose_1 = 'rent'
            AND (
                date(leads.createdAt) BETWEEN date('2023-01-01')
                AND date('2023-12-12')
            )
    ) AS subquery
GROUP BY
    hour_am_pm
ORDER BY
    STR_TO_DATE(
        CONCAT(
            SUBSTRING(hour_am_pm, 1, 2),
            ' ',
            SUBSTRING(hour_am_pm, -2)
        ),
        '%h %p'
    ) ASC;
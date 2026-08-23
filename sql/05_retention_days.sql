WITH user_activity AS (
    SELECT
        user_pseudo_id,
        PARSE_DATE('%Y%m%d', event_date) AS activity_date
    FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
    WHERE user_pseudo_id IS NOT NULL
    GROUP BY user_pseudo_id, activity_date
),
first_activity AS (
    SELECT
        user_pseudo_id,
        MIN(activity_date) AS first_date
    FROM user_activity
    GROUP BY user_pseudo_id
),
retention AS (
    SELECT
        a.user_pseudo_id,
        DATE_DIFF(a.activity_date, f.first_date, DAY) AS days_since_first
    FROM user_activity a
    JOIN first_activity f
      ON a.user_pseudo_id = f.user_pseudo_id
),
base AS (
    SELECT COUNT(DISTINCT user_pseudo_id) AS total_users
    FROM first_activity
)
SELECT
    r.days_since_first,
    COUNT(DISTINCT r.user_pseudo_id) AS retained_users,
    ROUND(
        SAFE_DIVIDE(COUNT(DISTINCT r.user_pseudo_id), b.total_users) * 100,
        2
    ) AS retention_rate
FROM retention r
CROSS JOIN base b
WHERE r.days_since_first IN (0, 1, 7, 14, 30)
GROUP BY r.days_since_first, b.total_users
ORDER BY r.days_since_first;

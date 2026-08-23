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
cohort_activity AS (
    SELECT
        a.user_pseudo_id,
        DATE_TRUNC(f.first_date, MONTH) AS cohort_month,
        DATE_DIFF(
            DATE_TRUNC(a.activity_date, MONTH),
            DATE_TRUNC(f.first_date, MONTH),
            MONTH
        ) AS month_number
    FROM user_activity a
    JOIN first_activity f
      ON a.user_pseudo_id = f.user_pseudo_id
),
cohort_size AS (
    SELECT
        cohort_month,
        COUNT(DISTINCT user_pseudo_id) AS cohort_users
    FROM cohort_activity
    WHERE month_number = 0
    GROUP BY cohort_month
),
cohort_retention AS (
    SELECT
        cohort_month,
        month_number,
        COUNT(DISTINCT user_pseudo_id) AS retained_users
    FROM cohort_activity
    GROUP BY cohort_month, month_number
)
SELECT
    r.cohort_month,
    r.month_number,
    s.cohort_users,
    r.retained_users,
    ROUND(
        SAFE_DIVIDE(r.retained_users, s.cohort_users) * 100,
        2
    ) AS retention_rate
FROM cohort_retention r
JOIN cohort_size s
  ON r.cohort_month = s.cohort_month
ORDER BY r.cohort_month, r.month_number;

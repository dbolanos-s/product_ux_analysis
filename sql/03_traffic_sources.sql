WITH traffic_funnel AS (
    SELECT
        COALESCE(traffic_source.source, '(unknown)') AS source_name,
        COUNT(DISTINCT CASE WHEN event_name = 'view_item' THEN user_pseudo_id END) AS view_item_users,
        COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_pseudo_id END) AS add_to_cart_users,
        COUNT(DISTINCT CASE WHEN event_name = 'begin_checkout' THEN user_pseudo_id END) AS checkout_users,
        COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_pseudo_id END) AS purchase_users
    FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
    GROUP BY COALESCE(traffic_source.source, '(unknown)')
)
SELECT
    source_name,
    view_item_users,
    add_to_cart_users,
    checkout_users,
    purchase_users,
    ROUND(SAFE_DIVIDE(add_to_cart_users, view_item_users) * 100, 2) AS view_to_cart_rate,
    ROUND(SAFE_DIVIDE(checkout_users, add_to_cart_users) * 100, 2) AS cart_to_checkout_rate,
    ROUND(SAFE_DIVIDE(purchase_users, checkout_users) * 100, 2) AS checkout_to_purchase_rate,
    ROUND(SAFE_DIVIDE(purchase_users, view_item_users) * 100, 2) AS overall_conversion_rate
FROM traffic_funnel
WHERE view_item_users >= 100
ORDER BY overall_conversion_rate DESC;

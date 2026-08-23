WITH product_metrics AS (
    SELECT
        item.item_name,
        COUNT(DISTINCT CASE WHEN event_name = 'view_item' THEN user_pseudo_id END) AS viewers,
        COUNT(DISTINCT CASE WHEN event_name = 'add_to_cart' THEN user_pseudo_id END) AS cart_users,
        COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN user_pseudo_id END) AS buyers,
        ROUND(AVG(CASE WHEN item.price > 0 THEN item.price END), 2) AS avg_price,
        SUM(CASE WHEN event_name = 'purchase' THEN item.quantity ELSE 0 END) AS units_purchased,
        ROUND(SUM(CASE WHEN event_name = 'purchase' THEN COALESCE(item.item_revenue, 0) ELSE 0 END), 2) AS revenue
    FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`,
    UNNEST(items) AS item
    WHERE item.item_name IS NOT NULL
    GROUP BY item.item_name
),
metrics AS (
    SELECT
        *,
        ROUND(SAFE_DIVIDE(cart_users, viewers) * 100, 2) AS view_to_cart_rate,
        ROUND(SAFE_DIVIDE(buyers, viewers) * 100, 2) AS conversion_rate
    FROM product_metrics
)
SELECT
    item_name,
    viewers,
    cart_users,
    buyers,
    avg_price,
    units_purchased,
    revenue,
    view_to_cart_rate,
    conversion_rate
FROM metrics
WHERE viewers >= 1000
  AND view_to_cart_rate >= 20
  AND conversion_rate <= 1
ORDER BY viewers DESC;

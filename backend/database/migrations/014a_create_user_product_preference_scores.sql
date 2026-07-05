BEGIN;

DROP VIEW IF EXISTS user_product_preference_scores;

CREATE VIEW user_product_preference_scores AS
WITH user_product_pairs AS (
  SELECT user_id, product_id
  FROM product_likes
  UNION
  SELECT user_id, product_id
  FROM product_wishlists
  UNION
  SELECT user_id, product_id
  FROM interactions
  WHERE interaction_type = 'whatsapp_inquiry'
),
whatsapp_pairs AS (
  SELECT DISTINCT user_id, product_id
  FROM interactions
  WHERE interaction_type = 'whatsapp_inquiry'
)
SELECT
  upp.user_id,
  upp.product_id,
  CASE WHEN pl.user_id IS NOT NULL THEN 1 ELSE 0 END AS active_like,
  CASE WHEN pw.user_id IS NOT NULL THEN 1 ELSE 0 END AS active_wishlist,
  CASE WHEN wp.user_id IS NOT NULL THEN 1 ELSE 0 END AS has_whatsapp_inquiry,
  (
    (CASE WHEN pl.user_id IS NOT NULL THEN 1.0 ELSE 0 END)
    + (CASE WHEN pw.user_id IS NOT NULL THEN 1.5 ELSE 0 END)
    + (CASE WHEN wp.user_id IS NOT NULL THEN 2.5 ELSE 0 END)
  ) AS implicit_score,
  (
    (
      (CASE WHEN pl.user_id IS NOT NULL THEN 1.0 ELSE 0 END)
      + (CASE WHEN pw.user_id IS NOT NULL THEN 1.5 ELSE 0 END)
      + (CASE WHEN wp.user_id IS NOT NULL THEN 2.5 ELSE 0 END)
    ) / 5.0
  ) AS normalized_score
FROM user_product_pairs upp
LEFT JOIN product_likes pl
  ON pl.user_id = upp.user_id
 AND pl.product_id = upp.product_id
LEFT JOIN product_wishlists pw
  ON pw.user_id = upp.user_id
 AND pw.product_id = upp.product_id
LEFT JOIN whatsapp_pairs wp
  ON wp.user_id = upp.user_id
 AND wp.product_id = upp.product_id
WHERE (
  (CASE WHEN pl.user_id IS NOT NULL THEN 1.0 ELSE 0 END)
  + (CASE WHEN pw.user_id IS NOT NULL THEN 1.5 ELSE 0 END)
  + (CASE WHEN wp.user_id IS NOT NULL THEN 2.5 ELSE 0 END)
) > 0;

COMMIT;

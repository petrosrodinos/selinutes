-- The per-product points cap is now a percentage of the price (100 = payable entirely with
-- points) instead of a fixed number of points.
ALTER TABLE "products" ADD COLUMN "max_discount_percent" INTEGER NOT NULL DEFAULT 0;

UPDATE "products" p
SET "max_discount_percent" = LEAST(
    100,
    CEIL(p."max_points" * 100.0 / GREATEST(1, CEIL(p."price" * c."points_per_currency_unit" / 100.0)))
)::INTEGER
FROM "app_config" c
WHERE c."id" = 1 AND p."max_points" > 0;

ALTER TABLE "products" DROP COLUMN "max_points";

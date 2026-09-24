-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_summary" TEXT,
ADD COLUMN     "points_per_currency_unit" INTEGER,
ADD COLUMN     "price_cents" INTEGER;

-- Backfill orders paid with real money (rate is unknown for older orders, so it stays NULL)
UPDATE "orders"
SET "price_cents" = "total" + "discount_cents",
    "payment_summary" = CASE
        WHEN "points_used" > 0 THEN '€' || to_char("total" / 100.0, 'FM999999990.00') || ' · ' || "points_used" || ' SEL used (−€' || to_char("discount_cents" / 100.0, 'FM999999990.00') || ')'
        ELSE '€' || to_char("total" / 100.0, 'FM999999990.00')
    END
WHERE "payment_method" = 'online';

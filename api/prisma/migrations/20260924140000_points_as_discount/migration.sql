-- Points-only products no longer exist: every product is sold for real money, and points
-- are an optional discount. Legacy points products keep their numeric price (points == cents
-- at the default rate), raised to the Stripe minimum of 50 cents.
UPDATE "products" SET "price" = GREATEST("price", 50) WHERE "payment_method" = 'points';

-- AlterTable
ALTER TABLE "products" DROP COLUMN "payment_method",
ADD COLUMN     "max_points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount_cents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points_used" INTEGER NOT NULL DEFAULT 0;

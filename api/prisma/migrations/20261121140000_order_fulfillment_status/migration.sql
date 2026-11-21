CREATE TYPE "FulfillmentStatus" AS ENUM ('verified', 'preparing', 'shipped', 'delivered');

ALTER TABLE "orders" ADD COLUMN "fulfillment_status" "FulfillmentStatus" NOT NULL DEFAULT 'verified';

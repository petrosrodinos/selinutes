ALTER TYPE "FulfillmentStatus" ADD VALUE 'pending_verification' BEFORE 'verified';

ALTER TABLE "products" ADD COLUMN "requires_verification" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "app_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "points_per_currency_unit" INTEGER NOT NULL DEFAULT 100,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

-- Default rate: 100 points = 1 USD. Product prices are now always USD cents; at this
-- rate existing points-priced products keep the same numeric price (points == cents).
INSERT INTO "app_config" ("id", "points_per_currency_unit", "updated_at") VALUES (1, 100, CURRENT_TIMESTAMP);

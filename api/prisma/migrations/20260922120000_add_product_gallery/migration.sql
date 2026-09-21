-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "product_uuid" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_images_uuid_key" ON "product_images"("uuid");

-- CreateIndex
CREATE INDEX "product_images_product_uuid_idx" ON "product_images"("product_uuid");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "products"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

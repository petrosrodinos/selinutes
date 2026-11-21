-- Existing image files stay visible in the store gallery
ALTER TABLE "product_files" ADD COLUMN "is_preview" BOOLEAN NOT NULL DEFAULT true;

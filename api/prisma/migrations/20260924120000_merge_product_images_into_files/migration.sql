-- Move existing gallery images into product_files (size is unknown for legacy rows)
INSERT INTO "product_files" ("uuid", "product_uuid", "name", "path", "size", "content_type", "created_at")
SELECT
    "uuid",
    "product_uuid",
    regexp_replace(regexp_replace("path", '^.*/', ''), '^[0-9]+-', ''),
    "path",
    0,
    CASE lower(regexp_replace("path", '^.*\.', ''))
        WHEN 'png' THEN 'image/png'
        WHEN 'webp' THEN 'image/webp'
        WHEN 'gif' THEN 'image/gif'
        ELSE 'image/jpeg'
    END,
    "created_at"
FROM "product_images";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_uuid_fkey";

-- DropTable
DROP TABLE "product_images";

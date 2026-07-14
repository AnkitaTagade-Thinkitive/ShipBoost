-- AlterTable: add Bar Width + Sticky settings (backward-compatible).
-- Default width is 'content' (fills the placement's container). Existing bars
-- placed "Below Header" (position = 'none') were full-viewport before this
-- feature, so migrate them to 'full' to preserve their behavior.
ALTER TABLE "ShipBoostSetting" ADD COLUMN "widthMode" TEXT NOT NULL DEFAULT 'content';
ALTER TABLE "ShipBoostSetting" ADD COLUMN "customWidth" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "ShipBoostSetting" ADD COLUMN "stickyPosition" TEXT NOT NULL DEFAULT 'normal';
UPDATE "ShipBoostSetting" SET "widthMode" = 'full' WHERE "position" = 'none';

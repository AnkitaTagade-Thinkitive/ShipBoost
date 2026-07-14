-- AlterTable: add Product Recommendations settings (backward-compatible).
-- Every column has a default, and recommendations are OFF by default, so
-- existing merchants see no change until they opt in.
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationSource" TEXT NOT NULL DEFAULT 'smart';
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationMax" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationLayout" TEXT NOT NULL DEFAULT 'horizontal';
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationShowImage" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationShowPrice" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationShowButton" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationHideAfterGoal" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationCollectionId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationProductIds" TEXT NOT NULL DEFAULT '';

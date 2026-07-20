-- Remove the Product Recommendations "Layout" setting. The storefront now uses
-- two fixed, placement-based components (a single-product header scroller and a
-- stacked product-page list), so the merchant-facing Layout option had no
-- effect. Safe to drop: the column was defaulted and is no longer read.
ALTER TABLE "ShipBoostSetting" DROP COLUMN "recommendationLayout";

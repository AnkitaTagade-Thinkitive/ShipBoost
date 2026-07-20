-- Add-to-Cart button customization for recommendations (backward-compatible).
-- `recommendationButtonMode` defaults to "theme" (auto-detect the theme button),
-- and `recommendationButton` holds the JSON style/override config, defaulting to
-- an empty object (no overrides) so existing storefronts are unchanged.
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationButtonMode" TEXT NOT NULL DEFAULT 'theme';
ALTER TABLE "ShipBoostSetting" ADD COLUMN "recommendationButton" TEXT NOT NULL DEFAULT '{}';

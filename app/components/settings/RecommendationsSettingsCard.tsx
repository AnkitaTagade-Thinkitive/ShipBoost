import { useAppBridge } from "@shopify/app-bridge-react";

import type {
  RecommendationLayout,
  RecommendationSource,
  ShipBoostSettings,
} from "../../lib/settings/types";
import {
  RECOMMENDATION_LAYOUT_OPTIONS,
  RECOMMENDATION_MAX_MAX,
  RECOMMENDATION_MAX_MIN,
  RECOMMENDATION_MAX_OPTIONS,
  RECOMMENDATION_SOURCE_OPTIONS,
} from "../../lib/settings/recommendations";
import { fieldChecked, fieldValue } from "../../lib/polaris/fieldEvents";

interface RecommendationsSettingsCardProps {
  settings: ShipBoostSettings;
  onChange: (patch: Partial<ShipBoostSettings>) => void;
  /** Whether the token has `read_products` (needed to fetch recommendations). */
  hasProductScope?: boolean;
}

// Responsive: columns wrap automatically on narrow viewports.
const RESPONSIVE_COLUMNS = "repeat(auto-fit, minmax(200px, 1fr))";

/** A single selected resource from the App Bridge resource picker. */
interface PickedResource {
  id: string;
}

/** Minimal structural type for the App Bridge resource picker. */
interface ResourcePickerApi {
  resourcePicker?: (options: {
    type: "product" | "collection";
    multiple?: boolean;
    selectionIds?: { id: string }[];
  }) => Promise<PickedResource[] | undefined>;
}

/** Split the stored comma-separated manual product GIDs into an array. */
function parseProductIds(raw: string): string[] {
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * "Product Recommendations" settings: suggest products that help the customer
 * reach the free-shipping goal. Off by default. Collection and manual sources
 * open the native App Bridge resource picker. Presentational only — reports
 * changes up via `onChange`.
 */
export function RecommendationsSettingsCard({
  settings,
  onChange,
  hasProductScope = true,
}: RecommendationsSettingsCardProps) {
  const shopify = useAppBridge() as unknown as ResourcePickerApi;

  const productIds = parseProductIds(settings.recommendationProductIds);

  const pickCollection = async () => {
    if (!shopify.resourcePicker) return;
    const selection = await shopify.resourcePicker({
      type: "collection",
      multiple: false,
      selectionIds: settings.recommendationCollectionId
        ? [{ id: settings.recommendationCollectionId }]
        : undefined,
    });
    if (selection && selection.length > 0) {
      onChange({ recommendationCollectionId: selection[0].id });
    }
  };

  const pickProducts = async () => {
    if (!shopify.resourcePicker) return;
    const selection = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      selectionIds: productIds.map((id) => ({ id })),
    });
    if (selection) {
      onChange({
        recommendationProductIds: selection.map((r) => r.id).join(","),
      });
    }
  };

  return (
    <s-section heading="Product Recommendations">
      <s-stack direction="block" gap="large">
        <s-switch
          label="Enable recommendations"
          details="Suggest products that help customers reach the free-shipping goal, shown below the progress bar."
          {...(settings.recommendationsEnabled ? { checked: true } : {})}
          onChange={(event) =>
            onChange({ recommendationsEnabled: fieldChecked(event) })
          }
        />

        {settings.recommendationsEnabled && !hasProductScope ? (
          <s-banner tone="warning" heading="Product access needed">
            <s-paragraph>
              Recommendations need permission to read your products, which was
              added in a recent update. Close and reopen ShipBoost (or reinstall
              it) to approve the new access. Until then, no product cards will
              appear on your storefront even though the preview shows samples.
            </s-paragraph>
          </s-banner>
        ) : null}

        {settings.recommendationsEnabled ? (
          <>
            <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
              <s-select
                label="Recommendation source"
                details="How recommended products are chosen."
                value={settings.recommendationSource}
                onChange={(event) =>
                  onChange({
                    recommendationSource: fieldValue(
                      event,
                    ) as RecommendationSource,
                  })
                }
              >
                {RECOMMENDATION_SOURCE_OPTIONS.map((option) => (
                  <s-option key={option.value} value={option.value}>
                    {option.label}
                  </s-option>
                ))}
              </s-select>

              <s-select
                label="Maximum products"
                details="How many product cards to show (1–4)."
                value={String(settings.recommendationMax)}
                onChange={(event) =>
                  onChange({
                    recommendationMax: Math.min(
                      Math.max(
                        Number(fieldValue(event)) || RECOMMENDATION_MAX_MIN,
                        RECOMMENDATION_MAX_MIN,
                      ),
                      RECOMMENDATION_MAX_MAX,
                    ),
                  })
                }
              >
                {RECOMMENDATION_MAX_OPTIONS.map((count) => (
                  <s-option key={count} value={String(count)}>
                    {String(count)}
                  </s-option>
                ))}
              </s-select>

              <s-select
                label="Layout"
                details="How the product cards are arranged."
                value={settings.recommendationLayout}
                onChange={(event) =>
                  onChange({
                    recommendationLayout: fieldValue(
                      event,
                    ) as RecommendationLayout,
                  })
                }
              >
                {RECOMMENDATION_LAYOUT_OPTIONS.map((option) => (
                  <s-option key={option.value} value={option.value}>
                    {option.label}
                  </s-option>
                ))}
              </s-select>
            </s-grid>

            {settings.recommendationSource === "collection" ? (
              <s-stack direction="block" gap="small-300">
                <s-button onClick={pickCollection}>
                  {settings.recommendationCollectionId
                    ? "Change collection"
                    : "Select collection"}
                </s-button>
                {settings.recommendationCollectionId ? (
                  <s-text color="subdued">1 collection selected.</s-text>
                ) : (
                  <s-text color="subdued">
                    Choose the collection to recommend products from.
                  </s-text>
                )}
              </s-stack>
            ) : null}

            {settings.recommendationSource === "manual" ? (
              <s-stack direction="block" gap="small-300">
                <s-button onClick={pickProducts}>
                  {productIds.length > 0
                    ? "Change products"
                    : "Select products"}
                </s-button>
                <s-text color="subdued">
                  {productIds.length > 0
                    ? `${productIds.length} product${productIds.length === 1 ? "" : "s"} selected.`
                    : "Choose the specific products to recommend."}
                </s-text>
              </s-stack>
            ) : null}

            <s-grid gridTemplateColumns={RESPONSIVE_COLUMNS} gap="base">
              <s-switch
                label="Show product image"
                {...(settings.recommendationShowImage ? { checked: true } : {})}
                onChange={(event) =>
                  onChange({ recommendationShowImage: fieldChecked(event) })
                }
              />
              <s-switch
                label="Show price"
                {...(settings.recommendationShowPrice ? { checked: true } : {})}
                onChange={(event) =>
                  onChange({ recommendationShowPrice: fieldChecked(event) })
                }
              />
              <s-switch
                label="Show Add to cart button"
                {...(settings.recommendationShowButton ? { checked: true } : {})}
                onChange={(event) =>
                  onChange({ recommendationShowButton: fieldChecked(event) })
                }
              />
            </s-grid>

            <s-switch
              label="Hide recommendations after goal reached"
              details="When the customer unlocks free shipping, hide the recommendations and show only the success message."
              {...(settings.recommendationHideAfterGoal ? { checked: true } : {})}
              onChange={(event) =>
                onChange({ recommendationHideAfterGoal: fieldChecked(event) })
              }
            />
          </>
        ) : null}
      </s-stack>
    </s-section>
  );
}

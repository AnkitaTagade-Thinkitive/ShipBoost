import { useState } from "react";

const FAQS = [
  {
    q: "Does ShipBoost work with every Shopify theme?",
    a: "Yes. ShipBoost installs as a native theme app extension, so it works with any Online Store 2.0 theme — no theme code editing required.",
  },
  {
    q: "Do I need coding knowledge?",
    a: "Not at all. Everything is configured from a visual settings panel and the Shopify Theme Editor. No development skills needed.",
  },
  {
    q: "Can I customize everything?",
    a: "You control colors, typography, spacing, icons, placement, animations and the free shipping goal — so it always matches your brand.",
  },
  {
    q: "Does ShipBoost slow down my store?",
    a: "No. ShipBoost is built to be fast and lightweight, loading only what's needed so your storefront stays quick.",
  },
  {
    q: "How long does setup take?",
    a: "Most merchants are live in just a few minutes: install, configure your settings, and enable the theme block.",
  },
];

/**
 * "Frequently Asked Questions" — an accessible accordion. Height animates
 * smoothly via a CSS grid-rows transition; open/closed state is tracked in
 * React and reflected with aria-expanded for screen readers.
 */
export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="sb-section sb-faq" aria-label="Frequently asked questions">
      <div className="sb-section__head">
        <span className="sb-eyebrow">FAQ</span>
        <h2 className="sb-section__title">Frequently Asked Questions</h2>
      </div>

      <div className="sb-faq__list">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className={`sb-faq__item${isOpen ? " is-open" : ""}`}
            >
              <button
                type="button"
                className="sb-faq__q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className="sb-faq__icon" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="sb-faq__answer">
                <div className="sb-faq__answer-inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

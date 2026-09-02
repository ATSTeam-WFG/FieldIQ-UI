// Single source of truth for every brand string in the customer app.
// Identifiers (directories, CSS classes, storage keys) are deliberately brand-free
// and do NOT belong here — only values that change if the product is renamed.

const NAME = 'FieldMT'
const COPYRIGHT_YEAR = 2026

export const BRAND = {
  name: NAME,
  // Used only for customer-visible artifacts (CSV export filenames).
  slug: 'fieldmt',
  // The wordmark is a two-tone pattern: stem in weight 600, accent in 700 + gold.
  wordmark: { stem: 'FIELD', accent: 'MT' },
  // Sentence case for in-page copy, title case for <title> and the PWA manifest.
  category: 'The field management tool for your book of business',
  categoryTitle: 'The Field Management Tool for Your Book of Business',
  description:
    'The field management tool for your book of business. Log a pop-by in thirty seconds, score every relationship, connect effort to revenue.',
  eyebrow: 'For the people behind every closing table',
  legal: `© ${COPYRIGHT_YEAR} ${NAME} · Privacy · Terms`,
} as const

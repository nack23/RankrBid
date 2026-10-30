// Single source of truth for the category taxonomy — used by the
// CategoryBar (nav pills) and by CategoryPage (the route each pill links
// to), so both always stay in sync.

export const CATEGORIES = [
  "All",
  "Leaderboards & Attention Markets",
  "AI Agents & Infrastructure",
  "SEO & AI Visibility",
  "Marketing & Advertising",
  "Analytics",
  "Crypto, Web3 & Investing",
  "Developer Tools",
  "Business, Finance & Legal",
  "Security, Privacy & Compliance",
  "Health, Fitness & Wellness",
  "Social Media & Creator Tools",
  "Hiring, Jobs & Careers",
  "Education & Learning",
  "Agencies, Studios & Services",
  "Ecommerce & Retail",
  "Domains & Web Assets",
  "Games & Entertainment",
  "People & Profiles",
  "Productivity & Personal Tools",
  "Design & Creative",
  "Writing & Content",
  "Directories, Launch & Discovery",
  "AI Media Generation",
  "Audio, Voice & Podcasting",
  "Sales & Lead Generation",
  "Travel, Local & Lifestyle",
  "Real Estate & Property",
  "Media & News",
  "Other",
];

// "AI Agents & Infrastructure" -> "ai-agents-and-infrastructure"
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findCategoryBySlug(slug) {
  return CATEGORIES.find((category) => slugify(category) === slug);
}

// A few names need a shorter word than the generic comma/"&" split below
// would give them (or have no comma/"&" to split on at all) — call these
// out explicitly. The full name still shows in the hover tooltip.
const SHORT_LABEL_OVERRIDES = {
  "Developer Tools": "Developer",
  "Social Media & Creator Tools": "Social",
  "AI Media Generation": "AI Media",
};

// The short, "dominant word" version of a category name shown on the
// category-bar pill itself, e.g. "AI Agents & Infrastructure" -> "AI Agents",
// "Crypto, Web3 & Investing" -> "Crypto". Checks the overrides above first,
// then falls back to splitting at the first comma/"&". Names with neither
// an override nor a comma/"&" (like "Other") are returned unchanged. The
// full name is then shown in a hover tooltip (see CategoryBar.jsx).
export function shortLabel(name) {
  if (SHORT_LABEL_OVERRIDES[name]) return SHORT_LABEL_OVERRIDES[name];
  const idx = name.search(/[,&]/);
  if (idx === -1) return name;
  return name.slice(0, idx).trim();
}

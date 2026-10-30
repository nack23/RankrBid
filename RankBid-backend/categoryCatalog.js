// Keep these names in sync with RankBid/src/data/categories.js.
// They are seeded by createTables.js so every category route can accept claims.
const categoryNames = [
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

function slugifyCategory(name) {
  return name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

module.exports = categoryNames.map((name) => ({ name, slug: slugifyCategory(name) }));

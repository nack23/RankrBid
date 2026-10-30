// Lightweight hand-drawn line icon set for the category bar.
// No external icon library needed — every icon is inline SVG (currentColor).

const base = {
  width: "18",
  height: "18",
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const GridIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="6" height="6" rx="1.2" />
    <rect x="11" y="3" width="6" height="6" rx="1.2" />
    <rect x="3" y="11" width="6" height="6" rx="1.2" />
    <rect x="11" y="11" width="6" height="6" rx="1.2" />
  </svg>
);

const CpuIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="6" y="6" width="8" height="8" rx="1.5" />
    <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.8 4.8l1.8 1.8M13.4 13.4l1.8 1.8M15.2 4.8l-1.8 1.8M6.6 13.4l-1.8 1.8" />
  </svg>
);

const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="8.5" cy="8.5" r="5.3" />
    <path d="M16 16l-3.3-3.3" />
  </svg>
);

const MegaphoneIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 8.5v3a1 1 0 001 1h1.3l2 4.2h1.9L8 12.5h1.2l6.8 3V5.5l-6.8 3H4a1 1 0 00-1 1z" />
  </svg>
);

const BarChartIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 17.5h15" />
    <path d="M5 17.5V10M10 17.5V4M15 17.5v-6.5" />
  </svg>
);

const CoinsIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="7" cy="7.5" r="4.5" />
    <circle cx="12.5" cy="12.5" r="4.5" />
  </svg>
);

const CodeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 5.5L2.5 10l4.5 4.5M13 5.5l4.5 4.5-4.5 4.5" />
  </svg>
);

const BriefcaseIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="2" y="6.2" width="16" height="10" rx="1.6" />
    <path d="M7 6.2V4.7A1.5 1.5 0 018.5 3.2h3a1.5 1.5 0 011.5 1.5v1.5" />
    <path d="M2 11.2h16" />
  </svg>
);

const ShieldIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10 2.3l6.5 2.6v4.6c0 4.3-2.8 7.2-6.5 7.7-3.7-.5-6.5-3.4-6.5-7.7V4.9z" />
  </svg>
);

const HeartIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10 17s-6.3-3.9-6.3-8.7A3.4 3.4 0 0110 5.8a3.4 3.4 0 016.3 2.5C16.3 13.1 10 17 10 17z" />
  </svg>
);

const ShareIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="15" cy="4.5" r="2" />
    <circle cx="15" cy="15.5" r="2" />
    <circle cx="5" cy="10" r="2" />
    <path d="M6.7 9l6.6-4M6.7 11l6.6 4" />
  </svg>
);

const TrophyIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 3h8v4a4 4 0 01-8 0V3z" />
    <path d="M6 4.2H3.2v1a3 3 0 002.8 3M14 4.2h2.8v1a3 3 0 01-2.8 3" />
    <path d="M10 11v3M7 17h6M8 14h4v3H8z" />
  </svg>
);

const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="7" cy="7" r="3" />
    <path d="M2 17c0-3 2.4-5 5-5s5 2 5 5" />
    <circle cx="15" cy="8" r="2.2" />
    <path d="M13 17c.2-2.3 1.7-4 3.5-4" />
  </svg>
);

const GraduationCapIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2 8l8-4 8 4-8 4-8-4z" />
    <path d="M5.5 10v3.4c0 1.4 2 2.5 4.5 2.5s4.5-1.1 4.5-2.5V10" />
  </svg>
);

const BuildingIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="3" width="12" height="14" rx="1" />
    <path d="M7 6.8h2M11 6.8h2M7 9.8h2M11 9.8h2M7 12.8h2M11 12.8h2" />
  </svg>
);

const ShoppingBagIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 7h10l-.8 9.1a1 1 0 01-1 .9H6.8a1 1 0 01-1-.9L5 7z" />
    <path d="M7 7V5.2a3 3 0 016 0V7" />
  </svg>
);

const GlobeIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="10" cy="10" r="7.3" />
    <path d="M2.7 10h14.6M10 2.7c2.1 2 3.3 4.9 3.3 7.3s-1.2 5.3-3.3 7.3c-2.1-2-3.3-4.9-3.3-7.3s1.2-5.3 3.3-7.3z" />
  </svg>
);

const GamepadIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="2" y="6.2" width="16" height="8.6" rx="4" />
    <path d="M6.3 8.6v4M4.3 10.6h4" />
    <path d="M13.8 9.6h.01M15.8 12h.01" />
  </svg>
);

const UserIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="10" cy="6.5" r="3.4" />
    <path d="M3.5 17c.7-3.4 3.3-5.4 6.5-5.4s5.8 2 6.5 5.4" />
  </svg>
);

const CheckSquareIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="14" height="14" rx="2.4" />
    <path d="M6.5 10.3l2.2 2.2L14 8" />
  </svg>
);

const PaletteIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10 2.6a7.4 7.4 0 100 14.8c1 0 1.5-.6 1.5-1.4 0-.4-.15-.7-.4-1a1.4 1.4 0 011-2.4h1.4a3 3 0 002.9-3.7A7.4 7.4 0 0010 2.6z" />
    <circle cx="6.6" cy="8.6" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="9" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12.4" cy="7.7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const PenIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 16l1-4L13.5 3.5a1.4 1.4 0 012 2L7 14l-4 2z" />
  </svg>
);

const CompassIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="10" cy="10" r="7.3" />
    <path d="M13 7l-2 4-4 2 2-4z" />
  </svg>
);

const SparklesIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10 3l1.2 3.8L15 8l-3.8 1.2L10 13l-1.2-3.8L5 8l3.8-1.2z" />
    <path d="M15.3 13.2l.5 1.6 1.6.5-1.6.5-.5 1.6-.5-1.6-1.6-.5 1.6-.5z" />
  </svg>
);

const MicIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" />
    <path d="M4.5 9.5a5.5 5.5 0 0011 0M10 15v3M7.5 18h5" />
  </svg>
);

const TrendingUpIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 14.5l5-5 3 3 6-6" />
    <path d="M13.2 5.7h3.3v3.3" />
  </svg>
);

const MapPinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" />
    <circle cx="10" cy="8" r="2.1" />
  </svg>
);

const HomeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 10l7-6 7 6" />
    <path d="M5 9v7a1 1 0 001 1h8a1 1 0 001-1V9" />
  </svg>
);

const NewspaperIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="2.3" y="4" width="12" height="12" rx="1.2" />
    <path d="M15.7 7v7.2A1.5 1.5 0 0117.2 12.7V7z" />
    <path d="M4.8 7.3h6M4.8 9.8h6M4.8 12.3h4" />
  </svg>
);

const TagIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10.6 2.5H4a1.5 1.5 0 00-1.5 1.5v6.4L10 17.9l7.5-7.5-7-7.9z" />
    <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const ICONS = {
  grid: GridIcon,
  cpu: CpuIcon,
  search: SearchIcon,
  megaphone: MegaphoneIcon,
  barChart: BarChartIcon,
  coins: CoinsIcon,
  code: CodeIcon,
  briefcase: BriefcaseIcon,
  shield: ShieldIcon,
  heart: HeartIcon,
  share: ShareIcon,
  trophy: TrophyIcon,
  users: UsersIcon,
  graduationCap: GraduationCapIcon,
  building: BuildingIcon,
  shoppingBag: ShoppingBagIcon,
  globe: GlobeIcon,
  gamepad: GamepadIcon,
  user: UserIcon,
  checkSquare: CheckSquareIcon,
  palette: PaletteIcon,
  pen: PenIcon,
  compass: CompassIcon,
  sparkles: SparklesIcon,
  mic: MicIcon,
  trendingUp: TrendingUpIcon,
  mapPin: MapPinIcon,
  home: HomeIcon,
  newspaper: NewspaperIcon,
  tag: TagIcon,
};

// Maps each category label (from CategoryBar's list) to an icon key.
export const CATEGORY_ICON_MAP = {
  "All": "grid",
  "AI Agents & Infrastructure": "cpu",
  "SEO & AI Visibility": "search",
  "Marketing & Advertising": "megaphone",
  "Analytics": "barChart",
  "Crypto, Web3 & Investing": "coins",
  "Developer Tools": "code",
  "Business, Finance & Legal": "briefcase",
  "Security, Privacy & Compliance": "shield",
  "Health, Fitness & Wellness": "heart",
  "Social Media & Creator Tools": "share",
  "Leaderboards & Attention Markets": "trophy",
  "Hiring, Jobs & Careers": "users",
  "Education & Learning": "graduationCap",
  "Agencies, Studios & Services": "building",
  "Ecommerce & Retail": "shoppingBag",
  "Domains & Web Assets": "globe",
  "Games & Entertainment": "gamepad",
  "People & Profiles": "user",
  "Productivity & Personal Tools": "checkSquare",
  "Design & Creative": "palette",
  "Writing & Content": "pen",
  "Directories, Launch & Discovery": "compass",
  "AI Media Generation": "sparkles",
  "Audio, Voice & Podcasting": "mic",
  "Sales & Lead Generation": "trendingUp",
  "Travel, Local & Lifestyle": "mapPin",
  "Real Estate & Property": "home",
  "Media & News": "newspaper",
  "Other": "tag",
};

export function CategoryIcon({ name, className = "h-[18px] w-[18px]" }) {
  const key = CATEGORY_ICON_MAP[name] || "tag";
  const Icon = ICONS[key] || TagIcon;
  return <Icon className={className} />;
}

export default CategoryIcon;

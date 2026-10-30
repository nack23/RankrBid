import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, slugify } from "../data/categories";
import { CategoryIcon } from "../components/CategoryIcons";
import ClaimAvatar from "../components/ClaimAvatar";
import BottomStats from "../components/BottomStats";
import usePaidClaims from "../hooks/usePaidClaims";
import { claimTimestamp, claimTitle, formatBid, sortByBid, timeAgo } from "../utils/claimPresentation";

const firstCategories = [
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
  "Leaderboards & Attention Markets",
];
const listedCategories = [
  ...firstCategories,
  ...CATEGORIES.filter((name) => name !== "All" && !firstCategories.includes(name)),
];

function TopClaim({ claim, rank }) {
  return <div className="flex min-w-0 items-center gap-2 py-1.5 text-[12px] sm:text-[13px]">
    <span className="w-5 shrink-0 font-semibold tabular-nums text-[#756b64] dark:text-[#ab9e95]">#{rank}</span>
    <ClaimAvatar target={claim.target} iconUrl={claim.favicon_url} small />
    <span className="min-w-0 flex-1 truncate text-[#5d534e] dark:text-[#d0c4bd]" title={claimTitle(claim)}>{claimTitle(claim)}</span>
    <strong className="shrink-0 font-semibold tabular-nums text-[#e46f50]">{formatBid(claim.amount)}</strong>
  </div>;
}

function Categories() {
  const { claims, loading, error, retry } = usePaidClaims();
  const groups = useMemo(() => {
    const grouped = new Map(listedCategories.map((name) => [name, []]));
    for (const claim of claims) {
      if (grouped.has(claim.category)) grouped.get(claim.category).push(claim);
    }
    return grouped;
  }, [claims]);
  const activeCategories = useMemo(() => listedCategories
    .map((name) => {
      const items = groups.get(name) || [];
      const latest = items.reduce((maximum, claim) => Math.max(maximum, new Date(claimTimestamp(claim)).getTime() || 0), 0);
      return { name, items: sortByBid(items), latest };
    })
    .filter((item) => item.items.length)
    .sort((left, right) => right.items.length - left.items.length || right.latest - left.latest)
    .slice(0, 3), [groups]);

  return <main className="mx-auto w-full max-w-[1000px] px-5 pb-16 pt-8 sm:px-7 lg:px-8">
    <header>
      <h1 className="text-[34px] font-bold leading-tight tracking-[-.045em] text-[#292725] sm:text-[42px] dark:text-[#f7f2ef]">Categories</h1>
      <p className="mt-3 text-[15px] leading-7 text-[#625a54] sm:text-[17px] dark:text-[#c7bdb6]">Every category has its own ranking. Pick one to see who leads it.</p>
    </header>

    {error && <div role="alert" className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><span>Live category rankings could not be refreshed.</span><button type="button" onClick={retry} className="font-semibold underline underline-offset-2">Try again</button></div>}

    <section className="mt-8 rounded-[28px] bg-[#f5f2ef] p-4 sm:p-5 dark:bg-[#29221e]" aria-labelledby="active-categories-title">
      <h2 id="active-categories-title" className="flex items-center gap-2 text-[15px] font-semibold text-[#292725] dark:text-white"><span className="h-2 w-2 rounded-full bg-[#ed7656]" />Most active categories</h2>
      <p className="mt-1 text-[13px] leading-5 text-[#756d68] dark:text-[#b8aaa2]">Where the most paid listings are — and who holds the top spot.</p>
      {loading ? <div className="mt-4 grid gap-3 sm:grid-cols-3" role="status" aria-label="Loading category activity">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-[22px] bg-white/80 dark:bg-white/5" />)}</div>
        : activeCategories.length ? <div className="mt-4 grid gap-3 sm:grid-cols-3">{activeCategories.map(({ name, items, latest }, index) => <Link key={name} to={`/category/${slugify(name)}`} className={`min-w-0 rounded-[22px] border bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-[#ed7656] hover:shadow-md dark:bg-[#241d19] dark:hover:shadow-none ${index === 0 ? "border-[#f2bca9] dark:border-[#9b5945]" : "border-[#e9e0d8] dark:border-[#493b33]"}`}>
          <div className="flex min-w-0 items-center gap-2.5"><CategoryIcon name={name} className="h-6 w-6 shrink-0 text-[#ed7656]" /><div className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-[.08em] text-[#ed7656]">#{index + 1}{index === 0 ? " most active" : ""}</span><h3 className="truncate text-[13px] font-semibold text-[#292725] sm:text-[14px] dark:text-white" title={name}>{name}</h3></div></div>
          <div className="mt-3 flex justify-between gap-2 text-[12px] text-[#756d68] dark:text-[#b8aaa2]"><span>{items.length} {items.length === 1 ? "listing" : "listings"}</span><span>{latest ? timeAgo(latest) : ""}</span></div>
          <div className="mt-2 flex min-w-0 items-center gap-2 border-t border-[#f1ece7] pt-2.5 dark:border-white/10"><ClaimAvatar target={items[0].target} iconUrl={items[0].favicon_url} small /><span className="min-w-0 flex-1 truncate text-[12px] text-[#554b45] dark:text-[#d0c4bd]" title={claimTitle(items[0])}>Leading {claimTitle(items[0])}</span><strong className="shrink-0 text-[12px] text-[#e46f50]">{formatBid(items[0].amount)}</strong></div>
        </Link>)}</div>
        : <p className="mt-4 rounded-2xl bg-white px-5 py-7 text-center text-sm text-[#756d68] dark:bg-[#241d19] dark:text-[#b8aaa2]">The first paid listing will appear here.</p>}
    </section>

    <section className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3" aria-label="All categories">
      {listedCategories.map((name) => {
        const topClaims = sortByBid(groups.get(name) || []).slice(0, 3);
        return <Link key={name} to={`/category/${slugify(name)}`} className="group flex min-w-0 flex-col rounded-[26px] border border-[#e9e0d8] bg-[#fffdfb] p-4 transition hover:-translate-y-0.5 hover:border-[#f2bca9] hover:shadow-[0_10px_24px_rgba(57,37,24,.06)] dark:border-[#463a32] dark:bg-[#211b18] dark:hover:border-[#a56650] dark:hover:shadow-none">
          <div className="flex min-h-9 items-center gap-3"><CategoryIcon name={name} className="h-7 w-7 shrink-0 text-[#ed7656]" /><h2 className="min-w-0 text-[14px] font-semibold leading-5 text-[#292725] sm:text-[15px] dark:text-[#f7f2ef]">{name}</h2></div>
          <div className="mt-3 min-h-[144px] rounded-[20px] bg-[#f6f4f2] px-3 py-2 dark:bg-[#2c2420]">
            {topClaims.length ? topClaims.map((claim, index) => <TopClaim key={claim.id} claim={claim} rank={index + 1} />)
              : <div className="flex h-full min-h-[128px] flex-col items-center justify-center text-center"><span className="text-[13px] text-[#8b8078] dark:text-[#ad9f97]">No rankings yet</span><span className="mt-1 text-xs font-medium text-[#d36343]">Be first to claim a spot →</span></div>}
          </div>
        </Link>;
      })}
    </section>
    <BottomStats />
  </main>;
}

export default Categories;

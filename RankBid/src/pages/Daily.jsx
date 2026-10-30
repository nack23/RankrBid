import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ClaimAvatar from "../components/ClaimAvatar";
import BottomStats from "../components/BottomStats";
import usePaidClaims from "../hooks/usePaidClaims";
import { claimDomain, claimTimestamp, claimTitle, formatBid, sortByBid, timeAgo, utcDayKey } from "../utils/claimPresentation";

const INITIAL_DAYS = 7;
const MORE_DAYS = 7;

function formatDate(day) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${day}T00:00:00Z`));
}

function timeToMidnightUtc(now) {
  const date = new Date(now);
  const next = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
  const seconds = Math.max(0, Math.floor((next - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return [hours, minutes, remaining].map((value) => String(value).padStart(2, "0")).join(":");
}

function DailyClaim({ claim, rank }) {
  const domain = claimDomain(claim.target);
  return <Link to={`/product/${claim.id}`} className={`flex min-w-0 items-start gap-3 rounded-[24px] p-3.5 transition hover:brightness-[.98] sm:items-center sm:p-4 dark:hover:brightness-110 ${rank === 1 ? "bg-[#fbe7df] dark:bg-[#38251f]" : rank === 2 ? "bg-[#fcf0ea] dark:bg-[#2e211d]" : "bg-[#fdf5f0] dark:bg-[#271e1a]"}`}>
    <span className="w-8 shrink-0 pt-2 text-[17px] font-bold text-[#e76f4e] sm:pt-0">#{rank}</span>
    <ClaimAvatar target={claim.target} iconUrl={claim.favicon_url} />
    <span className="min-w-0 flex-1">
      <span className="flex min-w-0 items-start justify-between gap-3"><strong className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#292725] sm:text-[16px] dark:text-white" title={claimTitle(claim)}>{claimTitle(claim)}</strong><strong className="shrink-0 text-[14px] font-semibold tabular-nums text-[#e76f4e]">{formatBid(claim.amount)}</strong></span>
      {claim.description && <span className="mt-0.5 block truncate text-[12px] text-[#8f8179] sm:text-[13px] dark:text-[#a99a92]" title={claim.description}>{claim.description}</span>}
      <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[#8f8179] sm:text-[12px] dark:text-[#a99a92]"><span className="font-semibold text-[#4b423d] dark:text-[#e1d5cf]">{claim.category}</span><span aria-hidden="true">·</span><span>{timeAgo(claimTimestamp(claim))}</span><span aria-hidden="true">·</span><span className="max-w-40 truncate" title={domain}>{domain}</span><span aria-hidden="true">·</span><span>{Number(claim.clicks || 0).toLocaleString()} clicks</span><span aria-hidden="true">·</span><span className="font-medium">see details</span></span>
    </span>
  </Link>;
}

function DayBoard({ day, claims, live, countdown }) {
  const [expanded, setExpanded] = useState(false);
  const visibleClaims = expanded ? claims : claims.slice(0, 3);
  return <section className={`rounded-[28px] border p-4 sm:p-5 ${live ? "border-[#ed7656] bg-[#fff6f1] dark:border-[#ad684f] dark:bg-[#2a1e19]" : "border-[#e9e0d8] bg-[#fffdfb] dark:border-[#463a32] dark:bg-[#211b18]"}`} aria-label={`${formatDate(day)} rankings`}>
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[#292725] sm:text-[18px] dark:text-white">{formatDate(day)}{live && <span className="inline-flex items-center gap-1 rounded-full bg-[#ed7656] px-2 py-0.5 text-[10px] font-semibold text-white"><span className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" />Live</span>}</h2>
      <span className="text-[12px] text-[#b55d40] sm:text-[13px] dark:text-[#f08b6b]">{live && `${countdown} left · `}{claims.length} {claims.length === 1 ? "listing" : "listings"}</span>
    </div>
    {live && <p className="mt-1.5 text-[12px] text-[#c56649] sm:text-[13px] dark:text-[#e6a08a]">This day is open for claims until midnight UTC.</p>}
    <div className="mt-4 space-y-2.5">{visibleClaims.length ? visibleClaims.map((claim, index) => <DailyClaim key={claim.id} claim={claim} rank={index + 1} />) : <p className="rounded-[22px] bg-white px-5 py-8 text-center text-sm text-[#756d68] dark:bg-[#382720] dark:text-[#c7b9b0]">No paid listings on this day yet.</p>}</div>
    <div className={`mt-4 grid gap-2.5 ${live ? "sm:grid-cols-2" : ""}`}>
      {live && <Link to="/?period=today#claim-rank" className="flex min-h-10 items-center justify-center rounded-full bg-[#ed7656] px-5 text-[13px] font-semibold text-white transition hover:bg-[#dc6544]">Claim a rank</Link>}
      {claims.length > 3 ? <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="min-h-10 rounded-full border border-[#e8ded6] bg-white px-5 text-[13px] font-semibold text-[#292725] transition hover:border-[#ed7656] dark:border-[#59463c] dark:bg-[#2a211d] dark:text-white">{expanded ? "Show top 3" : `Show all ${claims.length} ranks`}</button>
        : live ? <Link to="/?period=today" className="flex min-h-10 items-center justify-center rounded-full border border-[#e8ded6] bg-white px-5 text-[13px] font-semibold text-[#292725] transition hover:border-[#ed7656] dark:border-[#59463c] dark:bg-[#2a211d] dark:text-white">View today's board</Link> : null}
    </div>
  </section>;
}

function Daily() {
  const { claims, loading, error, retry } = usePaidClaims();
  const [now, setNow] = useState(Date.now);
  const [visibleDays, setVisibleDays] = useState(INITIAL_DAYS);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date(now).toISOString().slice(0, 10);
  const boards = useMemo(() => {
    const grouped = new Map([[today, []]]);
    for (const claim of claims) {
      const day = utcDayKey(claimTimestamp(claim));
      if (!day) continue;
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day).push(claim);
    }
    return [...grouped.entries()]
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([day, items]) => ({ day, claims: sortByBid(items) }));
  }, [claims, today]);

  return <main className="mx-auto w-full max-w-[1000px] px-5 pb-16 pt-8 sm:px-7 lg:px-8">
    <header><h1 className="text-[34px] font-bold leading-tight tracking-[-.045em] text-[#292725] sm:text-[42px] dark:text-[#f7f2ef]">Daily</h1><p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#625a54] sm:text-[17px] dark:text-[#c7bdb6]">Each UTC day has its own board. Today stays live until midnight UTC; previous days show the paid listings from that day.</p></header>
    {error && <div role="alert" className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><span>Daily rankings could not be refreshed.</span><button type="button" onClick={retry} className="font-semibold underline underline-offset-2">Try again</button></div>}
    {loading ? <div className="mt-8 space-y-4" role="status" aria-label="Loading daily rankings">{[1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-[28px] border border-[#e9e0d8] bg-white/70 dark:border-[#463a32] dark:bg-white/5" />)}</div>
      : <div className="mt-8 space-y-3.5">{boards.slice(0, visibleDays).map(({ day, claims: dayClaims }) => <DayBoard key={day} day={day} claims={dayClaims} live={day === today} countdown={timeToMidnightUtc(now)} />)}
        {boards.length > visibleDays && <button type="button" onClick={() => setVisibleDays((count) => count + MORE_DAYS)} className="mx-auto block rounded-full border border-[#e8ded6] bg-white px-6 py-2.5 text-sm font-semibold text-[#292725] hover:border-[#ed7656] dark:border-[#59463c] dark:bg-[#2a211d] dark:text-white">Show older days</button>}
      </div>}
    <BottomStats />
  </main>;
}

export default Daily;

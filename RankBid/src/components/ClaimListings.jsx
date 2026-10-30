import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import BottomStats from "./BottomStats";
import ClaimAvatar from "./ClaimAvatar";
import { CategoryIcon } from "./CategoryIcons";
import { shortLabel } from "../data/categories";

const PAGE_SIZE = 20;
const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth() && date.getUTCDate() === now.getUTCDate();
}

function targetUrl(target) {
  if (!target?.trim()) return null;
  const value = target.trim();
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function domainOf(target) {
  try { return new URL(targetUrl(target)).hostname.replace(/^www\./, ""); }
  catch { return target?.trim() || "Website"; }
}

function timeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const units = [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  const [duration, name] = units.find(([duration]) => seconds >= duration);
  const count = Math.floor(seconds / duration);
  return `${count} ${name}${count === 1 ? "" : "s"} ago`;
}

function ClaimCard({ claim, rank, onVisit }) {
  const domain = domainOf(claim.target);
  const title = claim.site_title?.trim() || domain;
  const featured = rank <= 3;
  const rowTone = rank === 1 ? "bg-[#fbe9e2] dark:bg-[#38251f]" : rank === 2 ? "bg-[#fcf1ec] dark:bg-[#2e211d]" : "bg-[#fdf6f1] dark:bg-[#271e1a]";
  return <article className={`group flex min-w-0 items-center gap-3 transition sm:gap-4 ${featured ? `mb-3 rounded-[26px] px-4 py-4 sm:px-5 ${rowTone}` : "border-b border-[#e9e0d8] px-3 py-4 hover:bg-[#f8f4f1] dark:border-[#3b302a] dark:hover:bg-[#271f1b]"}`}>
    <span className={`w-8 shrink-0 text-base font-bold tabular-nums sm:w-9 sm:text-lg ${featured ? "text-[#e76f4e]" : "text-[#756d68] dark:text-[#b8aaa2]"}`}>#{rank}</span>
    <ClaimAvatar target={claim.target} iconUrl={claim.favicon_url} size={featured ? "featured" : "row"} />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <button type="button" onClick={() => onVisit(claim)} className="min-w-0 flex-1 truncate text-left text-[15px] font-semibold text-[#292725] hover:text-[#d36343] focus-visible:outline-2 focus-visible:outline-orange-500 sm:text-[16px] dark:text-white" title={`Visit ${title}`}>{title}</button>
        <strong className="shrink-0 text-[14px] font-semibold tabular-nums text-[#e76f4e] sm:text-[15px]">{formatMoney(claim.amount)}</strong>
      </div>
      {claim.description && <p className="mt-0.5 truncate text-[13px] leading-5 text-[#8c817b] sm:text-[14px] dark:text-[#a99a92]" title={claim.description}>{claim.description}</p>}
      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[#8c817b] sm:text-[12px] dark:text-[#a99a92]">
        {claim.category && <span className="inline-flex items-center gap-1 font-semibold text-[#403b37] dark:text-stone-200" title={claim.category}><CategoryIcon name={claim.category} className="h-3.5 w-3.5" />{shortLabel(claim.category)}</span>}
        {claim.category && <span aria-hidden="true">·</span>}
        <span>{timeAgo(claim.paid_at || claim.created_at)}</span><span aria-hidden="true">·</span>
        <span className="max-w-28 truncate sm:max-w-44" title={domain}>{domain}</span><span aria-hidden="true">·</span>
        <span>{Number(claim.clicks || 0).toLocaleString()} clicks</span><span aria-hidden="true">·</span>
        <Link to={`/product/${claim.id}`} className="font-medium text-[#746b66] underline-offset-2 hover:text-[#d36343] hover:underline focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-[#b7aaa3]">see details</Link>
      </div>
    </div>
  </article>;
}

function CompactClaim({ claim, rank, onVisit }) {
  const title = claim.site_title?.trim() || domainOf(claim.target);
  return <div className="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-2 transition hover:bg-[#f5f1ed] dark:hover:bg-[#2b221e]">
    <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-[#756d68] dark:text-[#b8aaa2]">#{rank}</span><ClaimAvatar target={claim.target} iconUrl={claim.favicon_url} size="sidebar" />
    <div className="min-w-0 flex-1"><button type="button" onClick={() => onVisit(claim)} title={title} className="block max-w-full truncate text-left text-[13px] font-medium text-stone-800 hover:text-[#d36343] focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-white">{title}</button></div>
    <strong className="shrink-0 text-xs tabular-nums text-[#c35e3e]">{formatMoney(claim.amount)}</strong>
  </div>;
}

function ClaimListings({ categorySlug = null, period = "all" }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    async function loadClaims() {
      setLoading(true);
      setError(false);
      try {
        const url = categorySlug ? `${API_URL}/api/claims/category/${categorySlug}` : `${API_URL}/api/claims`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load rankings");
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Could not load rankings");
        setClaims(data.claims || []);
      } catch (loadError) {
        if (loadError.name !== "AbortError") { console.error("Claims fetch error:", loadError); setClaims([]); setError(true); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    loadClaims();
    return () => controller.abort();
  }, [categorySlug]);

  useEffect(() => setCurrentPage(1), [period, categorySlug]);

  const allTimeClaims = useMemo(() => [...claims].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0)), [claims]);
  const todayClaims = useMemo(() => allTimeClaims.filter((claim) => isToday(claim.paid_at || claim.created_at)), [allTimeClaims]);
  const primaryClaims = period === "today" ? todayClaims : allTimeClaims;
  const secondaryClaims = period === "today" ? allTimeClaims : todayClaims;
  const primaryTitle = period === "today" ? "Today's leaderboard" : "All-time leaderboard";
  const secondaryTitle = period === "today" ? "All-time ranking" : "Trending today";
  const totalPages = Math.max(1, Math.ceil(primaryClaims.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const visibleClaims = primaryClaims.slice(start, start + PAGE_SIZE);

  function getVisitorId() {
    try {
      let id = localStorage.getItem("rankbid_visitor_id");
      if (!id) { id = crypto.randomUUID(); localStorage.setItem("rankbid_visitor_id", id); }
      return id;
    } catch { return crypto.randomUUID(); }
  }

  async function registerClick(id) {
    try {
      const response = await fetch(`${API_URL}/api/claims/${id}/click`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitorId: getVisitorId() }) });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) setClaims((previous) => previous.map((claim) => claim.id === id ? { ...claim, clicks: Number(data.clicks || 0) } : claim));
    } catch (clickError) { console.error("Claim click error:", clickError); }
  }

  function visit(claim) {
    const url = targetUrl(claim.target);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
    registerClick(claim.id);
  }

  const pageNumbers = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const candidates = [1, page - 1, page, page + 1, totalPages].filter((number) => number >= 1 && number <= totalPages);
    return [...new Set(candidates)].sort((a, b) => a - b);
  })();

  return <section className="mx-auto w-full max-w-[1000px] px-5 pb-16 pt-1 sm:px-7 sm:pt-3 lg:px-8" aria-label="Rankings">
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="min-w-0"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white"><span className="h-2 w-2 rounded-full bg-[#ed7656]" />{primaryTitle}</h3><span className="text-xs text-stone-400">Sorted by bid</span></div>
        {loading ? <div className="space-y-3" role="status" aria-label="Loading rankings">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-stone-100 bg-white/70 dark:border-white/10 dark:bg-white/5" />)}<span className="sr-only">Loading rankings…</span></div>
        : error ? <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#211d1a]"><p className="text-lg font-bold text-stone-900 dark:text-white">Rankings are unavailable</p><p className="mt-2 text-sm text-stone-500">Please refresh the page to try again.</p></div>
        : visibleClaims.length === 0 ? <div className="rounded-2xl border border-dashed border-[#e6d4c8] bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#211d1a]"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e8] text-xl text-[#d36343]">↗</div><p className="mt-4 text-lg font-bold text-stone-900 dark:text-white">The board is open</p><p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{period === "today" ? "No one has claimed a spot today. Be the first." : "No listings yet. Your product could take the first spot."}</p><a href="#claim-rank" className="mt-5 inline-block text-sm font-bold text-[#c35e3e] hover:underline">Claim a spot ↑</a></div>
        : <div>{visibleClaims.map((claim, index) => <ClaimCard key={claim.id} claim={claim} rank={start + index + 1} onVisit={visit} />)}</div>}
        {!loading && !error && totalPages > 1 && <nav aria-label="Ranking pages" className="mt-8 flex flex-wrap items-center justify-center gap-2"><button type="button" disabled={page === 1} onClick={() => setCurrentPage(page - 1)} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 disabled:opacity-40 dark:border-white/10 dark:text-stone-300">← Previous</button>{pageNumbers.map((number, index) => <span key={number} className="flex items-center gap-2">{index > 0 && number - pageNumbers[index - 1] > 1 && <span className="text-stone-400">…</span>}<button type="button" aria-current={number === page ? "page" : undefined} onClick={() => setCurrentPage(number)} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold ${number === page ? "bg-[#ed7656] text-white" : "text-stone-600 hover:bg-[#fff0e8] dark:text-stone-300"}`}>{number}</button></span>)}<button type="button" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 disabled:opacity-40 dark:border-white/10 dark:text-stone-300">Next →</button><p className="w-full text-center text-xs text-stone-400">Showing {start + 1}–{Math.min(start + PAGE_SIZE, primaryClaims.length)} of {primaryClaims.length}</p></nav>}
      </div>
      <aside className="min-w-0 lg:sticky lg:top-28"><div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-[15px] font-semibold text-[#292725] dark:text-white"><span className="h-2 w-2 rounded-full bg-[#ed7656]" aria-hidden="true" />{secondaryTitle}</h3><Link to={period === "today" ? "/" : "/daily"} className="shrink-0 text-xs font-medium text-[#e46f50] hover:underline">See all ›</Link></div><p className="mt-1 pl-4 text-xs text-[#8c817b] dark:text-[#a99a92]">{period === "today" ? "The biggest bids overall" : "Fresh spots on today's board"}</p><div className="mt-3">{loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-11 animate-pulse rounded-lg bg-stone-100 dark:bg-white/5" />)}</div> : secondaryClaims.length ? secondaryClaims.slice(0, 10).map((claim, index) => <CompactClaim key={claim.id} claim={claim} rank={index + 1} onVisit={visit} />) : <p className="rounded-2xl bg-[#f7f3ef] p-4 text-sm leading-6 text-[#756d68] dark:bg-[#2b221e] dark:text-[#b8aaa2]">No listings here yet. Check back soon.</p>}</div></aside>
    </div>
    <BottomStats />
  </section>;
}

export default ClaimListings;

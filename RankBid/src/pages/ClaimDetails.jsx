import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../config";
import ClaimAvatar from "../components/ClaimAvatar";
import { CategoryIcon } from "../components/CategoryIcons";
import BottomStats from "../components/BottomStats";
import { claimDomain, claimTimestamp, claimTitle, timeAgo } from "../utils/claimPresentation";

function websiteUrl(target) {
  if (!target?.trim()) return null;
  try {
    const value = target.trim();
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function RankCard({ label, rank, total, description, to, linkLabel }) {
  const hasRank = Number.isInteger(Number(rank)) && Number(rank) > 0;
  return <div className="flex min-h-[180px] flex-col rounded-[24px] border border-[#e8e0d8] bg-white px-5 py-5 dark:border-[#41362f] dark:bg-[#28211d] sm:px-6">
    <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#796d66] dark:text-[#b7aaa0]">{label}</p>
    <p className="mt-2 text-[36px] font-bold leading-none tracking-tight tabular-nums text-[#282421] dark:text-[#f7f2ef] sm:text-[40px]">{hasRank ? `#${rank}` : "—"}</p>
    <p className="mt-2 text-[13px] leading-5 text-[#625a54] dark:text-[#c4b8ae]">{hasRank ? `of ${Number(total || 0).toLocaleString("en-US")} ${description}` : "Not on today's board"}</p>
    <Link to={to} className="mt-auto pt-4 text-[13px] font-semibold text-[#ed7656] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed7656]">{linkLabel} <span aria-hidden="true">→</span></Link>
  </div>;
}

function ClaimDetails() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/claims/${id}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success || !data.claim) throw new Error(data.message || "This listing could not be found.");
        return data;
      })
      .then((details) => setResult({ id, details, error: "" }))
      .catch((cause) => { if (cause.name !== "AbortError") setResult({ id, details: null, error: cause.message || "Could not load this listing." }); });
    return () => controller.abort();
  }, [id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { setCopied(false); }
  }

  const error = result?.id === id ? result.error : "";
  const details = result?.id === id ? result.details : null;
  if (!details || error) return <main className="mx-auto min-h-[50vh] w-full max-w-[1040px] px-5 py-16 text-center sm:px-7">
    <p className="text-[17px] text-[#625a54] dark:text-[#c4b8ae]" role={error ? "alert" : "status"}>{error || "Loading listing…"}</p>
    {error && <Link to="/" className="mt-5 inline-block font-semibold text-[#ed7656] hover:underline">Back to rankings →</Link>}
  </main>;

  const { claim, ranks = {}, totals = {} } = details;
  const categoryPath = claim.category_slug ? `/category/${claim.category_slug}` : "/categories";
  const targetUrl = websiteUrl(claim.target);
  const domain = claimDomain(claim.target);
  const description = claim.description?.trim();
  const rankCards = [
    { label: "Category rank", rank: ranks.category, total: totals.category, description: `in ${claim.category}`, to: categoryPath, linkLabel: "See category ranking" },
    { label: "Overall rank", rank: ranks.overall, total: totals.overall, description: "on the board", to: "/", linkLabel: "See overall ranking" },
    { label: `Today in ${claim.category}`, rank: ranks.todayCategory, total: totals.todayCategory, description: `in ${claim.category} today`, to: `${categoryPath}?period=today`, linkLabel: "See today's category ranking" },
    { label: "Today overall", rank: ranks.todayOverall, total: totals.todayOverall, description: "on today's board", to: "/?period=today", linkLabel: "See today's ranking" },
  ];

  return <main className="mx-auto w-full max-w-[1040px] px-5 pb-14 pt-8 sm:px-7 sm:pt-10 lg:px-8">
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-[#716760] dark:text-[#c3b8b1]">
      <Link to="/" className="hover:text-[#ed7656] hover:underline">Leaderboard</Link><span aria-hidden="true">·</span>
      <Link to={categoryPath} className="hover:text-[#ed7656] hover:underline">{claim.category}</Link>
    </nav>
    <article className="rounded-[30px] border-[1.5px] border-[#087a4a] bg-[#eff6f1] px-6 py-7 text-[#202723] dark:border-[#57a77e] dark:bg-[#203128] dark:text-[#f6f7f4] sm:px-9 sm:py-9 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <ClaimAvatar target={claim.target} iconUrl={claim.favicon_url} size="hero" />
        <div className="min-w-0 flex-1">
          <h1 className="max-w-[850px] break-words text-[clamp(1.9rem,3.2vw,3rem)] font-bold leading-[1.12] tracking-[-.04em]">{claimTitle(claim)}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-[#575e58] dark:text-[#c6d0c8] sm:text-[14px]">
            <Link to={categoryPath} className="inline-flex items-center gap-1.5 font-medium text-[#222e26] hover:underline dark:text-[#e9f2eb]"><CategoryIcon name={claim.category} className="h-4 w-4" />{claim.category}</Link>
            <span aria-hidden="true">·</span><span className="font-medium text-[#087a4a] dark:text-[#76d9a4]">{domain}</span>
            <span aria-hidden="true">·</span><span>{timeAgo(claimTimestamp(claim))}</span>
            <span aria-hidden="true">·</span><span>{Number(claim.clicks || 0).toLocaleString("en-US")} {Number(claim.clicks || 0) === 1 ? "click" : "clicks"}</span>
          </div>
        </div>
      </div>
      <p className="mt-7 max-w-[850px] text-[15px] leading-7 text-[#4e5750] dark:text-[#d0d9d2] sm:text-[17px] sm:leading-8">{description || "No description has been added for this listing yet."}</p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        {targetUrl && <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#087a4a] px-6 text-[14px] font-semibold text-white transition hover:bg-[#00663e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087a4a] dark:bg-[#188857] dark:hover:bg-[#269d67]">Visit website <span aria-hidden="true">↗</span></a>}
        <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#dedbd4] bg-white px-6 text-[14px] font-semibold text-[#2d332e] transition hover:border-[#087a4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087a4a] dark:border-[#55695c] dark:bg-[#273a2e] dark:text-white">{copied ? "Link copied" : "Copy link"}</button>
      </div>
    </article>
    <section aria-label="Listing ranks" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{rankCards.map((card) => <RankCard key={card.label} {...card} />)}</section>
    <BottomStats />
  </main>;
}

export default ClaimDetails;

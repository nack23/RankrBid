import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const formatCount = (value) => value === null ? "—" : Number(value).toLocaleString("en-US");

function BottomStats() {
  const [counts, setCounts] = useState({ visitors: null, products: null, today: null });

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      const [visitors, claims] = await Promise.allSettled([
        fetch(API_URL + "/api/visitors/stats", { signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("Visitor stats unavailable");
          return response.json();
        }),
        fetch(API_URL + "/api/claims/stats", { signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("Claim stats unavailable");
          return response.json();
        }),
      ]);

      if (controller.signal.aborted) return;
      setCounts((previous) => ({
        visitors: visitors.status === "fulfilled" && visitors.value.success
          ? Number(visitors.value.total || 0) : previous.visitors,
        products: claims.status === "fulfilled" && claims.value.success
          ? Number(claims.value.allTime || 0) : previous.products,
        today: claims.status === "fulfilled" && claims.value.success
          ? Number(claims.value.today || 0) : previous.today,
      }));
    }

    loadStats();
    const interval = setInterval(loadStats, 30000);
    const refreshVisible = () => {
      if (document.visibilityState === "visible") loadStats();
    };
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, []);

  const stats = [
    { label: "visitors", value: counts.visitors, icon: <span className="text-[14px] text-emerald-600" aria-hidden="true">●</span> },
    { label: "products listed", value: counts.products, icon: <span className="text-[24px] font-medium text-[#ed7656]" aria-hidden="true">#</span> },
    { label: "rankings today", value: counts.today, icon: <span className="text-[23px] font-medium text-[#ed7656]" aria-hidden="true">↑</span> },
  ];

  return (
    <footer className="mt-14 border-t border-[#ebe4dc] pb-3 pt-10 text-center dark:border-[#382f29]">
      <p className="mx-auto max-w-3xl text-[15px] leading-7 text-[#625a54] sm:text-lg dark:text-[#c7bdb6]">
        Some stats about this{" "}
        <Link to="/about" className="font-medium text-[#ed7656] hover:text-[#d45d3d]">
          ranking marketplace
        </Link>{" "}
        since its launch.
      </p>

      <div className="mx-auto mt-6 grid max-w-[920px] gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-h-[112px] flex-col items-center justify-center rounded-[26px] border border-[#f3ece6] bg-white px-4 py-5 shadow-[0_18px_38px_rgba(60,45,35,0.07)] dark:border-[#3b302a] dark:bg-[#251e1a] dark:shadow-none">
            <div className="flex min-h-9 items-center justify-center gap-2">
              {stat.icon}
              <span className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-[#292522] sm:text-[32px] dark:text-white">{formatCount(stat.value)}</span>
            </div>
            <p className="mt-2 text-sm text-[#756d68] dark:text-[#a99c94]">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-[#625a54] sm:text-[15px] dark:text-[#c7bdb6]">
        Built by <span className="font-medium text-[#ed7656]">Qais Alam</span>
        <span className="mx-1.5 text-stone-400" aria-hidden="true">·</span>
        Made for people building on the web
      </p>

      <nav aria-label="Footer" className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-sm text-[#ed7656]">
        <Link to="/rules" className="hover:underline">Rules</Link><span aria-hidden="true">·</span>
        <Link to="/terms" className="hover:underline">Terms</Link><span aria-hidden="true">·</span>
        <Link to="/privacy" className="hover:underline">Privacy</Link><span aria-hidden="true">·</span>
        <Link to="/about" className="hover:underline">About</Link><span aria-hidden="true">·</span>
        <Link to="/stats" className="hover:underline">Live stats</Link>
      </nav>

      <Link to="/about" className="mx-auto mt-6 inline-flex items-center gap-2.5 rounded-full border border-[#e8dfd7] bg-white px-3 py-2 text-left shadow-sm transition hover:border-[#ed7656] hover:shadow-md dark:border-[#46362e] dark:bg-[#251e1a] dark:shadow-none" aria-label="About RankBid.lol">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ed7656] text-sm font-black text-white">R</span>
        <span><strong className="block text-sm leading-tight text-[#292522] dark:text-white">RankBid.lol</strong><span className="block text-[10px] uppercase tracking-[.1em] text-[#8a8177]">Bid · Rank · Grow</span></span>
        <span className="ml-3 text-lg font-bold text-[#292522] dark:text-white" aria-hidden="true">↗</span>
      </Link>
    </footer>
  );
}

export default BottomStats;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomStats from "../components/BottomStats";
import { API_URL } from "../config";

const formatCount = (value) => value === null ? "—" : value.toLocaleString("en-US");

function About() {
  const [activity, setActivity] = useState({
    online: null,
    visitsToday: null,
    clicks: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      const [visitors, claims] = await Promise.allSettled([
        fetch(`${API_URL}/api/visitors/stats`, { signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("Visitor stats unavailable");
          return response.json();
        }),
        fetch(`${API_URL}/api/claims/stats`, { signal: controller.signal }).then((response) => {
          if (!response.ok) throw new Error("Claim stats unavailable");
          return response.json();
        }),
      ]);

      if (controller.signal.aborted) return;
      setActivity((previous) => ({
        online: visitors.status === "fulfilled" && visitors.value.success
          ? Number(visitors.value.online) : previous.online,
        visitsToday: visitors.status === "fulfilled" && visitors.value.success
          ? Number(visitors.value.today) : previous.visitsToday,
        clicks: claims.status === "fulfilled" && claims.value.success
          ? Number(claims.value.totalClicks) : previous.clicks,
      }));
    }

    loadActivity();
    const interval = window.setInterval(loadActivity, 30000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const stats = [
    { label: "online now", value: activity.online, prefix: "●", green: true },
    { label: "visits today", value: activity.visitsToday, prefix: "↗" },
    { label: "listing clicks", value: activity.clicks, prefix: "↗" },
  ];

  return (
    <main className="mx-auto w-full max-w-[830px] px-5 pb-14 pt-8 sm:px-7 sm:pt-12">
      <header>
        <h1 className="text-[34px] font-bold leading-tight tracking-[-.045em] text-[#292725] sm:text-[42px] dark:text-[#f7f2ef]">
          About
        </h1>
        <p className="mt-5 text-[16px] leading-8 text-[#625a54] sm:text-[18px] dark:text-[#c7bdb6]">
          RankBid.lol is a <span className="font-medium text-[#ed7656]">public ranking marketplace</span> for products, websites, and projects. Explore what people are building, or claim a place on the board for your own work.
        </p>
      </header>

      <section className="mt-10 border-t border-[#ebe4dc] pt-9 dark:border-[#382f29]">
        <h2 className="text-[20px] font-semibold tracking-tight text-[#292725] sm:text-[23px] dark:text-[#f7f2ef]">
          How it works
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-[#625a54] sm:text-[16px] dark:text-[#c7bdb6]">
          Each paid claim places a listing on the all-time board and in its category. Higher bids move above lower bids; a new bid can change the order at any time. The Today board shows paid claims made since midnight UTC and starts fresh each day.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/" className="rounded-full bg-[#ed7656] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#d86143]">Explore the board →</Link>
          <Link to="/categories" className="rounded-full border border-[#e8dfd7] bg-white px-4 py-2 text-[13px] font-semibold text-[#554b45] transition hover:border-[#ed7656] dark:border-[#493b33] dark:bg-[#251e1a] dark:text-[#eee6e0]">Browse categories</Link>
        </div>
      </section>

      <section className="mt-10 border-t border-[#ebe4dc] pt-9 dark:border-[#382f29]" aria-labelledby="activity-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="activity-heading" className="text-[20px] font-semibold tracking-tight text-[#292725] sm:text-[23px] dark:text-[#f7f2ef]">
            Happening on RankBid
          </h2>
          <Link to="/stats" className="text-[13px] font-semibold text-[#e46f50] hover:underline">Live stats →</Link>
        </div>
        <p className="mt-2 text-[14px] leading-6 text-[#756d68] dark:text-[#b8aaa2]">
          These numbers come from the marketplace database and refresh automatically.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[22px] border border-[#e9e0d8] bg-[#fffdfb] px-4 py-5 dark:border-[#463a32] dark:bg-[#251e1a]">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className={stat.green ? "text-[13px] text-emerald-600" : "text-[18px] text-[#ed7656]"}>{stat.prefix}</span>
                <strong className="text-[25px] leading-none tracking-tight tabular-nums text-[#292725] dark:text-white">{formatCount(stat.value)}</strong>
              </div>
              <p className="mt-2 text-[13px] text-[#756d68] dark:text-[#b8aaa2]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[24px] bg-[#f7f3ef] px-5 py-6 sm:px-6 dark:bg-[#29221e]">
        <h2 className="text-[18px] font-semibold text-[#292725] dark:text-white">Built for discovery</h2>
        <p className="mt-2 text-[14px] leading-7 text-[#625a54] sm:text-[15px] dark:text-[#c7bdb6]">
          Rankings are public so visitors can find new tools and creators. A position reflects a paid bid, not an editorial endorsement. Read the <Link to="/rules" className="font-medium text-[#e46f50] underline underline-offset-2">rules</Link> before claiming a rank.
        </p>
      </section>

      <BottomStats />
    </main>
  );
}

export default About;

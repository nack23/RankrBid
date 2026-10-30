import { Link } from "react-router-dom";
import BottomStats from "../components/BottomStats";

function Stats() {
  return (
    <main className="mx-auto w-full max-w-[1000px] px-5 pb-16 pt-10 sm:px-7 sm:pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#ed7656]">RankBid.lol</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#292725] sm:text-4xl dark:text-white">Live stats</h1>
        <p className="mt-3 text-sm leading-6 text-[#756d68] sm:text-base dark:text-stone-300">A quick look at visitors and paid listings across the marketplace. The numbers refresh automatically while this page is open.</p>
        <Link to="/" className="mt-5 inline-flex rounded-full border border-[#e7ddd4] bg-white px-4 py-2 text-sm font-semibold text-[#c35e3e] hover:border-[#ed7656] dark:border-white/15 dark:bg-white/5">← Back to the board</Link>
      </div>
      <BottomStats />
    </main>
  );
}

export default Stats;

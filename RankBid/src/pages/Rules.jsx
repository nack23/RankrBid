import { Link } from "react-router-dom";
import BottomStats from "../components/BottomStats";

const rules = [
  {
    title: "How ranks are decided",
    points: [
      "Higher paid bids rank above lower paid bids. If bids are equal, the earlier listing keeps its place.",
      "The all-time board shows the overall ranking. Every category has its own ranking too.",
      "A displayed rank is an estimate until payment is confirmed. New claims can change a listing's position.",
    ],
  },
  {
    title: "Today and daily boards",
    points: [
      "Today shows paid claims made during the current UTC day. It resets at midnight UTC.",
      "The Daily page keeps previous UTC days available to browse. A previous day's board no longer accepts claims.",
      "A listing may appear on the all-time board and on a daily board at the same time.",
    ],
  },
  {
    title: "What you can list",
    points: [
      "Submit a real product, website, service, or public profile that fits the category you choose.",
      "Use a working link that leads to the listed destination. Do not send visitors to unrelated or misleading pages.",
      "Spam, malware, unlawful content, and adult or sexually explicit destinations are not allowed.",
    ],
  },
  {
    title: "Categories and links",
    points: [
      "Choose the closest category so visitors can find relevant listings. We may correct a category when needed.",
      "Tracking parameters may be removed. Short links may be rejected if their final destination cannot be verified.",
      "If your listing needs a correction, contact support with the listing URL and the change you need.",
    ],
  },
  {
    title: "Payments and listings",
    points: [
      "The bid is shown in USD on the board. Review the final INR checkout amount before paying through Razorpay.",
      "A listing becomes eligible to appear publicly after the payment is confirmed. Website visits may be counted as listing clicks.",
      "Completed claims are not automatically refundable. Review the bid, destination, category, and Terms before paying.",
    ],
  },
];

function Rules() {
  return (
    <main className="mx-auto w-full max-w-[830px] px-5 pb-14 pt-8 sm:px-7 sm:pt-12">
      <header>
        <h1 className="text-[34px] font-bold leading-tight tracking-[-.045em] text-[#292725] sm:text-[42px] dark:text-[#f7f2ef]">Rules</h1>
        <p className="mt-5 text-[16px] leading-8 text-[#625a54] sm:text-[18px] dark:text-[#c7bdb6]">
          A few clear rules keep the rankings useful for everyone. Please read these before claiming a place on the board.
        </p>
      </header>

      <div className="mt-9 space-y-9">
        {rules.map((section, index) => (
          <section key={section.title} className="border-t border-[#ebe4dc] pt-7 dark:border-[#382f29]">
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[#ed7656]" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="text-[20px] font-semibold tracking-tight text-[#292725] sm:text-[22px] dark:text-[#f7f2ef]">{section.title}</h2>
            </div>
            <ul className="mt-4 space-y-3 pl-7">
              {section.points.map((point) => (
                <li key={point} className="relative text-[14px] leading-7 text-[#625a54] before:absolute before:-left-5 before:top-[11px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#ed7656] sm:text-[15px] dark:text-[#c7bdb6]">
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <aside className="mt-10 rounded-[24px] bg-[#f7f3ef] px-5 py-6 sm:px-6 dark:bg-[#29221e]">
        <h2 className="text-[18px] font-semibold text-[#292725] dark:text-white">Need help with a listing?</h2>
        <p className="mt-2 text-[14px] leading-7 text-[#625a54] sm:text-[15px] dark:text-[#c7bdb6]">
          Email <a href="mailto:cosmicwaveglaxy@gmail.com" className="font-medium text-[#e46f50] underline underline-offset-2">cosmicwaveglaxy@gmail.com</a> with the listing link. The <Link to="/terms" className="font-medium text-[#e46f50] underline underline-offset-2">Terms of Service</Link> and <Link to="/privacy" className="font-medium text-[#e46f50] underline underline-offset-2">Privacy Policy</Link> have more detail.
        </p>
      </aside>

      <BottomStats />
    </main>
  );
}

export default Rules;

import { Link } from "react-router-dom";

function LegalPageLayout({ eyebrow, title, introduction, sections, related }) {
  return <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
    <div className="mb-6 text-sm text-stone-500 dark:text-stone-400"><Link to="/" className="hover:text-[#d36343]">Home</Link><span className="mx-2">/</span><span className="text-stone-800 dark:text-stone-200">{title}</span></div>
    <header className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d36343]">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#292725] sm:text-4xl dark:text-white">{title}</h1>
      <p className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-300">{introduction}</p>
    </header>

    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/25 dark:text-amber-100">
      <strong className="block font-semibold">Draft for operator review</strong>
      This working copy needs the operator's full business address and a final legal review before live checkout is enabled.
    </div>

    <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      <nav aria-label={`${title} sections`} className="self-start rounded-2xl border border-[#ece5de] bg-white p-4 lg:sticky lg:top-6 dark:border-white/10 dark:bg-white/5">
        <p className="px-2 text-xs font-bold uppercase tracking-[.15em] text-stone-400">On this page</p>
        <ul className="mt-3 space-y-1">{sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="block rounded-lg px-2 py-2 text-sm text-stone-600 hover:bg-[#fff2eb] hover:text-[#c35e3e] dark:text-stone-300 dark:hover:bg-white/10">{section.title}</a></li>)}</ul>
      </nav>

      <div className="min-w-0 space-y-5">{sections.map((section, index) => <section key={section.id} id={section.id} className="scroll-mt-6 rounded-2xl border border-[#ece5de] bg-white px-5 py-6 sm:px-7 dark:border-white/10 dark:bg-[#211d1a]">
        <div className="flex items-start gap-4"><span className="mt-0.5 text-xs font-bold tabular-nums text-[#d36343]">{String(index + 1).padStart(2, "0")}</span><h2 className="text-lg font-bold tracking-tight text-[#292725] sm:text-xl dark:text-white">{section.title}</h2></div>
        <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600 sm:text-[15px] dark:text-stone-300">{section.content}</div>
      </section>)}
        <div className="flex flex-wrap gap-3 pt-3"><Link to="/rules" className="rounded-full border border-[#e6ddd5] bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ed7656] hover:text-[#d36343] dark:border-white/15 dark:bg-white/5 dark:text-stone-200">View ranking rules →</Link><Link to={related.to} className="rounded-full border border-[#e6ddd5] bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ed7656] hover:text-[#d36343] dark:border-white/15 dark:bg-white/5 dark:text-stone-200">{related.label} →</Link></div>
      </div>
    </div>
  </main>;
}

export default LegalPageLayout;

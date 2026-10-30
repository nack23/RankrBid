import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { CategoryIcon } from "./CategoryIcons";

const money = (value) => `$${Number(value || 0).toLocaleString()}`;
const inr = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const fieldClass = "mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-white/15 dark:bg-white/5 dark:text-white";
const secondaryButton = "inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-white/15 dark:bg-white/5 dark:text-stone-200";
const primaryButton = "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ed7656] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(237,118,86,.22)] transition hover:bg-[#dc6544] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-wait disabled:opacity-60";

const paymentMethods = [
  { id: "upi", icon: "UPI", title: "UPI", subtitle: "UPI app; QR if available", detail: "Pay with a UPI app. Razorpay may offer a desktop QR or UPI ID according to your device and merchant account." },
  { id: "card", icon: "▭", title: "Credit or debit card", subtitle: "Indian cards; international if enabled", detail: "Enter card details in Razorpay's secure checkout. International cards work only after this store is approved for them." },
  { id: "netbanking", icon: "▤", title: "Netbanking", subtitle: "Pay from your bank account", detail: "Choose your bank and approve the payment in Razorpay's secure checkout." },
  { id: "other", icon: "••", title: "Other methods", subtitle: "See all available options", detail: "View every payment method enabled for your account in Razorpay checkout." },
];

function StepHeader({ step, title, description, onClose, disabled = false }) {
  return (
    <div className="border-b border-stone-100 px-5 py-5 sm:px-7 dark:border-white/10">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#d36343]">Step {step} of 3</p>
          <h2 id={step === 1 ? "confirm-title" : step === 2 ? "details-title" : "payment-title"} className="mt-1 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">{description}</p>
        </div>
        <button type="button" onClick={onClose} disabled={disabled} aria-label="Close dialog" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 text-xl text-stone-500 transition hover:bg-stone-100 disabled:opacity-40 dark:border-white/15">×</button>
      </div>
      <div className="mt-5 flex gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((item) => <span key={item} className={`h-1 flex-1 rounded-full ${item <= step ? "bg-[#ed7656]" : "bg-stone-200 dark:bg-white/15"}`} />)}
      </div>
    </div>
  );
}

function Dialog({ children, labelledBy, wide = false, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("button, input, select")?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") closeRef.current?.();
      if (event.key !== "Tab") return;
      const elements = [...(dialogRef.current?.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]") || [])];
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-950/65 p-0 backdrop-blur-[3px] sm:items-center sm:p-4" role="presentation">
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={`max-h-[96dvh] w-full overflow-y-auto rounded-t-[24px] bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-[24px] dark:bg-[#211d1a] ${wide ? "max-w-5xl" : "max-w-[480px]"}`}>{children}</div>
  </div>;
}

function BidControl({ amount, min, onDecrease, onIncrease, large = false, modal = false }) {
  const control = `flex shrink-0 items-center justify-center rounded-full bg-[#fdebe5] font-medium text-[#d36343] transition hover:bg-[#f9ddd4] focus-visible:outline-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-[#39241e] dark:text-[#ed7656] dark:hover:bg-[#483027] ${modal ? "h-7 w-7 text-base" : "h-8 w-8 text-lg"}`;
  return <div className={`flex items-center ${modal ? "gap-1.5 sm:justify-end" : "gap-2 sm:gap-3"}`}>
    <button type="button" aria-label="Decrease bid by one dollar" disabled={Number(amount) <= min} onClick={onDecrease} className={control}>−</button>
    <div className={`text-center font-bold tabular-nums text-[#ed7656] ${large ? "min-w-16 text-[28px] sm:text-[34px] lg:text-[40px]" : modal ? "min-w-10 text-[26px] leading-none" : "min-w-16 text-xl"}`}>{money(amount)}</div>
    <button type="button" aria-label="Increase bid by one dollar" onClick={onIncrease} className={control}>+</button>
  </div>;
}

function CategoryPicker({ categories, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function toggle() {
    if (disabled) return;
    if (!open) setActiveIndex(Math.max(0, categories.findIndex((item) => item.name === value)));
    setOpen((previous) => !previous);
  }

  function choose(item) {
    onChange(item.name);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(event) {
    if (disabled) return;
    if (event.key === "Escape") {
      if (open) { event.preventDefault(); setOpen(false); }
      return;
    }
    if (event.key === "Tab") { setOpen(false); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        setActiveIndex(Math.max(0, categories.findIndex((item) => item.name === value)));
        setOpen(true);
      } else if (event.key === "Home") setActiveIndex(0);
      else if (event.key === "End") setActiveIndex(categories.length - 1);
      else setActiveIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + categories.length) % categories.length);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(categories[activeIndex]);
    }
  }

  return <div ref={rootRef} className="relative min-w-0 text-left" onKeyDown={onKeyDown}>
    <button ref={triggerRef} type="button" role="combobox" aria-label="Choose a category" aria-haspopup="listbox" aria-controls={open ? "rankbid-category-options" : undefined} aria-expanded={open} aria-activedescendant={open ? `rankbid-category-option-${activeIndex}` : undefined} disabled={disabled} onClick={toggle} className="flex h-11 w-full items-center justify-between gap-3 rounded-full border border-[#e6ddd5] bg-white px-4 text-left text-[15px] font-normal text-[#4f4945] transition hover:border-[#d9c9bd] focus-visible:border-[#ed7656] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed7656] disabled:cursor-not-allowed sm:px-5 dark:border-[#4a403b] dark:bg-[#25201d] dark:text-[#e9dfda] dark:hover:border-[#766052]">
      <span className="truncate">{value || "Choose a category"}</span>
      <svg aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#756d68] transition-transform dark:text-[#aaa09a] ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7.5 5 5 5-5" /></svg>
    </button>
    {open && <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-full overflow-hidden rounded-[20px] border border-[#e6ddd5] bg-white shadow-[0_18px_45px_rgba(57,37,24,.17)] dark:border-[#4a403b] dark:bg-[#2b2420] dark:shadow-[0_18px_45px_rgba(0,0,0,.35)]">
      <div id="rankbid-category-options" ref={listRef} role="listbox" aria-label="Categories" className="max-h-[min(390px,50dvh)] overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((item, index) => <div key={item.slug} id={`rankbid-category-option-${index}`} role="option" aria-selected={value === item.name} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(item)} className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] leading-5 sm:text-[14px] ${activeIndex === index ? "bg-[#fff1eb] text-[#26201d] dark:bg-[#40312a] dark:text-white" : "text-[#38322e] hover:bg-[#faf5f1] dark:text-[#e8ded8] dark:hover:bg-white/5"}`}>
          <CategoryIcon name={item.name} className="h-[17px] w-[17px] shrink-0 text-[#918780] dark:text-[#c18069]" />
          <span className="min-w-0 flex-1">{item.name}</span>
          {value === item.name && <span aria-hidden="true" className="text-[#ed7656]">✓</span>}
        </div>)}
      </div>
      <button type="button" aria-label="Scroll to more categories" onClick={() => { listRef.current?.scrollBy({ top: 220, behavior: "smooth" }); triggerRef.current?.focus(); }} className="flex h-8 w-full items-center justify-center border-t border-[#f0e8e2] bg-white text-[#5c524d] transition hover:bg-[#faf5f1] dark:border-[#453831] dark:bg-[#2b2420] dark:text-[#d7cac3] dark:hover:bg-[#382d27]"><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7.5 5 5 5-5" /></svg></button>
    </div>}
  </div>;
}

function ClaimRankUI({
  hidePeriodToggle, period, countdown, handlePeriodChange, primaryRank, globalAllTimeRank, showGlobalRank, rankingLoading, bidWasAdjusted,
  bidAmount, MIN_BID, decreaseBid, increaseBid, target, setTarget,
  selectedCategory, setSelectedCategory, categories, handleClaimClick,
  rankingError, retryRankings,
  loading, showConfirm, setShowConfirm, termsAccepted, setTermsAccepted, continueToDetails,
  showDetails, setShowDetails, form, detailsError, updateForm, backToConfirm, continueToPayment,
  showPayment, setShowPayment, backToDetails, handleRazorpayPayment,
  paymentAmountInr, paymentError, showSuccess, successData, closeSuccess,
  pendingOrder, paymentStatus, checkPendingPayment, resumePendingPayment, clearPendingPayment,
  previewQuote,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const quoted = previewQuote?.amountUsd === Number(bidAmount) && !previewQuote.error;
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [methodStatus, setMethodStatus] = useState({ state: "loading", methods: null });
  const [methodRetry, setMethodRetry] = useState(0);
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === paymentMethod);
  const methodEnabled = (methodId) => methodStatus.state === "ready"
    ? Boolean(methodStatus.methods?.[methodId])
    : methodStatus.state === "error" && methodId === "other";

  function changeCategory(name) {
    const chosen = categories.find((item) => item.name === name);
    if (!chosen) return;
    setSelectedCategory(name);
    const path = `/category/${chosen.slug}`;
    if (location.pathname !== path) {
      navigate(path, { state: { rankBidDraft: { target, period, bidWasAdjusted, bidAmount: bidWasAdjusted ? bidAmount : undefined } } });
    }
  }

  useEffect(() => {
    if (!showPayment) return;
    const controller = new AbortController();
    fetch(`${API_URL}/api/payments/methods`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "Payment methods unavailable");
        return data.methods;
      })
      .then((methods) => setMethodStatus({ state: "ready", methods }))
      .catch((error) => { if (error.name !== "AbortError") setMethodStatus({ state: "error", methods: null }); });
    return () => controller.abort();
  }, [showPayment, methodRetry]);

  return <>
    <section id="claim-rank" className="mx-auto w-full max-w-[1000px] px-5 pb-6 pt-4 text-center sm:px-7 sm:pb-6 sm:pt-4 lg:px-8">
      {!hidePeriodToggle && <div className="inline-flex rounded-full border border-[#eadfd7] bg-white p-0.5 shadow-sm dark:border-[#382f29] dark:bg-[#1b1714] dark:shadow-none" role="group" aria-label="Ranking period">
        {[{ value: "all", label: "All-time" }, { value: "today", label: "Today" }].map((item) => <button key={item.value} type="button" onClick={() => handlePeriodChange(item.value)} aria-pressed={period === item.value} className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1 text-[13px] font-semibold transition ${period === item.value ? "bg-[#ed7656] text-white" : "text-[#ad654e] hover:bg-[#fff3ee] dark:text-[#c5bcb6] dark:hover:bg-white/5"}`}>{item.value === "today" && <span aria-hidden="true" className={`h-2 w-2 rounded-full motion-safe:animate-pulse ${period === "today" ? "bg-white" : "bg-[#ed7656]"}`} />}{item.label}</button>)}
      </div>}
      {period === "today" && <p className="mt-1.5 text-[13px] text-stone-500 dark:text-stone-400">Resets every day at midnight UTC · {countdown} left</p>}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-[clamp(1.75rem,2.8vw,2.75rem)] font-bold leading-tight tracking-[-.045em] text-[#292725] dark:text-white">
        {rankingLoading ? <span role="status">Checking live rank…</span> : rankingError ? <span>Rankings temporarily unavailable</span> : <><span>Claim {period === "today" ? "today's" : "all-time"} #{primaryRank} for</span><BidControl amount={bidAmount} min={MIN_BID} onDecrease={decreaseBid} onIncrease={increaseBid} large /></>}
      </div>

      {rankingError && <div role="alert" className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200"><span>We couldn't load live rankings. Please try again shortly.</span><button type="button" onClick={retryRankings} disabled={loading} className="rounded-full border border-amber-300 px-3 py-1 font-semibold hover:bg-amber-100 disabled:opacity-50 dark:border-amber-600 dark:hover:bg-amber-900/30">{loading ? "Retrying…" : "Retry rankings"}</button></div>}

      <div className="mx-auto mt-4 grid max-w-4xl gap-3 md:grid-cols-[minmax(0,1fr)_minmax(200px,255px)_auto]">
        <label className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-[#e6ddd5] bg-white px-4 text-left transition focus-within:border-[#ed7656] focus-within:ring-4 focus-within:ring-[#ed7656]/10 sm:px-5 dark:border-[#4a403b] dark:bg-[#25201d]">
          <span aria-hidden="true" className="text-[17px] text-[#d36343]">◎</span>
          <span className="sr-only">Product URL or @handle</span>
          <input type="text" inputMode="url" autoComplete="url" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Your product URL or @handle" className="min-w-0 w-full bg-transparent text-[15px] text-stone-800 outline-none placeholder:text-stone-500 dark:text-white" />
        </label>
        <CategoryPicker categories={categories} value={selectedCategory} onChange={changeCategory} disabled={false} />
        <button type="button" onClick={handleClaimClick} disabled={loading || rankingLoading || rankingError} className="h-11 rounded-full bg-[#ed7656] px-6 text-[14px] font-semibold text-white transition hover:bg-[#db6748] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-60">{loading || rankingLoading ? "Checking…" : "Claim rank"}</button>
      </div>
      {pendingOrder && !showSuccess && <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
        <div className="min-w-0"><p className="font-semibold">Previous payment {paymentStatus === "checking" ? "is being checked" : paymentStatus === "unavailable" ? "status is temporarily unavailable" : "is awaiting confirmation"}</p><p className="mt-0.5 break-all text-xs opacity-80">{pendingOrder.target} · {inr(pendingOrder.amountInr)} · {pendingOrder.orderId}</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => checkPendingPayment()} className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100">Check status</button><button type="button" onClick={resumePendingPayment} className="rounded-full bg-[#ed7656] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#db6748]">Resume payment</button><button type="button" onClick={clearPendingPayment} disabled={paymentStatus !== "pending"} className="rounded-full px-2 py-1.5 text-xs font-semibold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-40">I wasn't charged · Start fresh</button></div>
      </div>}
    </section>

    {showConfirm && <Dialog labelledBy="confirm-title" onClose={() => setShowConfirm(false)}>
      <div className="px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="confirm-title" className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">Confirm this rank</h2><p className="mt-2 text-sm leading-5 text-stone-500 dark:text-stone-400">Check the rank and bid, then agree to the Terms of Service to continue.</p></div>
          <button type="button" onClick={() => setShowConfirm(false)} aria-label="Close dialog" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-stone-600 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-stone-300 dark:hover:bg-white/10">×</button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 rounded-[22px] bg-[#f8f6f3] p-4 sm:grid-cols-2 dark:bg-white/5">
          <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[.1em] text-stone-500 dark:text-stone-400">Estimated rank</p><p className="mt-1 text-[28px] font-bold leading-none tracking-tight text-stone-900 dark:text-white">#{primaryRank}</p><p className="mt-2 text-xs leading-4 text-stone-500 dark:text-stone-400">{period === "today" ? "Today" : "All-time"} · {selectedCategory}</p>{showGlobalRank && <p className="mt-2 text-xs leading-4 text-stone-600 dark:text-stone-300">All board · all-time: <strong className="font-semibold text-[#c35e3e] dark:text-[#f08b6b]">{globalAllTimeRank === null ? "Unavailable" : `#${globalAllTimeRank}`}</strong></p>}</div>
          <div className="min-w-0 sm:text-right"><p className="text-[11px] font-bold uppercase tracking-[.1em] text-stone-500 dark:text-stone-400">Your bid</p><div className="mt-1"><BidControl amount={bidAmount} min={MIN_BID} onDecrease={decreaseBid} onIncrease={increaseBid} modal /></div><p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Shown in USD</p></div>
        </div>

        <p className="mt-4 break-all text-xs font-medium text-stone-700 dark:text-stone-300">Listing: {target}</p>
        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">Your listing can appear on the {period === "today" ? "today and all-time boards" : "all-time board"} after payment is confirmed. {period === "today" ? "Today's board resets at midnight UTC. " : ""}Another bid can change your rank.</p>

        <div className="mt-5 flex items-start gap-3 rounded-[20px] border border-[#e9e2dc] bg-[#fffdfb] px-4 py-3.5 dark:border-white/15 dark:bg-white/5">
          <input id="rank-terms-consent" type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#ed7656]" />
          <label htmlFor="rank-terms-consent" className="text-sm leading-6 text-stone-800 dark:text-stone-200">I have read and agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="font-medium text-[#d36343] underline underline-offset-2 hover:text-[#b94f31]">Terms of Service</Link> of RankBid.lol.</label>
        </div>
        <div className="mt-2.5 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400"><Link to="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#d36343]">Privacy</Link><span>·</span><Link to="/rules" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#d36343]">Rules</Link></div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-[#eee8e1] bg-[#faf9f7] px-5 py-4 sm:px-6 dark:border-white/10 dark:bg-white/[0.03]">
        <button type="button" onClick={() => setShowConfirm(false)} className={`${secondaryButton} min-h-10 rounded-full px-5`}>Cancel</button>
        <button type="button" onClick={continueToDetails} disabled={!termsAccepted} className={`${primaryButton} min-h-10 rounded-full px-5 disabled:cursor-not-allowed disabled:opacity-45`}>Continue to checkout</button>
      </div>
    </Dialog>}

    {showDetails && <Dialog labelledBy="details-title" wide onClose={() => setShowDetails(false)}>
      <div className="grid lg:grid-cols-[.85fr_1.15fr]">
        <aside className="border-b border-stone-100 bg-[#faf7f4] p-6 sm:p-8 lg:border-b-0 lg:border-r dark:border-white/10 dark:bg-white/5">
          <button type="button" onClick={backToConfirm} className="text-sm font-semibold text-stone-500 hover:text-[#d36343] dark:text-stone-300">← Back to rank</button>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#c35e3e]">Order summary</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">Rank #{primaryRank} listing</h3>
          <p className="mt-2 break-all text-sm text-stone-600 dark:text-stone-300">{target}</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{selectedCategory}</p>
          <div className="mt-6 space-y-4 border-t border-stone-200 pt-5 text-sm dark:border-white/10">
            <div className="flex justify-between gap-3"><span className="text-stone-500 dark:text-stone-400">Ranking bid</span><strong className="text-stone-900 dark:text-white">{money(bidAmount)}</strong></div>
            <div className="flex justify-between gap-3"><span className="text-stone-500 dark:text-stone-400">Payable currency</span><strong className="text-stone-900 dark:text-white">INR</strong></div>
            <div className="flex justify-between gap-3 border-t border-stone-200 pt-4 dark:border-white/10"><span className="font-semibold text-stone-700 dark:text-stone-200">Estimated total</span><strong className="text-xl text-[#c35e3e]">{quoted ? inr(previewQuote.amountInr) : "Calculating…"}</strong></div>
          </div>
          <p className="mt-5 text-xs leading-5 text-stone-500 dark:text-stone-400">The final INR amount appears in Razorpay before you approve the payment.</p>
        </aside>
        <div>
          <StepHeader step={2} title="Contact information" description="Enter your details to continue to secure payment." onClose={() => setShowDetails(false)} />
          <div className="space-y-4 px-5 py-6 sm:px-8">
            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Full name <span className="text-[#d36343]">*</span><input value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} autoComplete="name" placeholder="e.g. John Doe" className={fieldClass} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Email <span className="text-[#d36343]">*</span><input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} autoComplete="email" placeholder="john@example.com" className={fieldClass} /></label>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Phone <span className="font-normal text-stone-400">optional</span><input type="tel" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} autoComplete="tel" placeholder="+91 98765 43210" className={fieldClass} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Country <span className="text-[#d36343]">*</span><input value={form.country} onChange={(event) => updateForm("country", event.target.value)} autoComplete="country-name" className={fieldClass} /></label>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">ZIP / postal code <span className="font-normal text-stone-400">optional</span><input value={form.zipCode} onChange={(event) => updateForm("zipCode", event.target.value)} autoComplete="postal-code" placeholder="Postal code" className={fieldClass} /></label>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 p-3 text-sm text-stone-700 dark:border-white/10 dark:text-stone-200"><input type="checkbox" checked={form.isBusiness} onChange={(event) => updateForm("isBusiness", event.target.checked)} className="accent-[#ed7656]" /> Purchasing as a business</label>
            {detailsError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{detailsError}</p>}
            <button type="button" onClick={continueToPayment} className={`${primaryButton} mt-2 w-full`}>Continue to payment →</button>
            <p className="text-center text-xs text-stone-400">Secure checkout is handled by Razorpay.</p>
          </div>
        </div>
      </div>
    </Dialog>}

    {showPayment && <Dialog labelledBy="payment-title" wide onClose={() => !loading && setShowPayment(false)}>
      <div className="grid lg:grid-cols-[.85fr_1.15fr]">
        <aside className="border-b border-stone-100 bg-[#faf7f4] p-6 sm:p-8 lg:border-b-0 lg:border-r dark:border-white/10 dark:bg-white/5">
          <button type="button" disabled={loading} onClick={backToDetails} className="text-sm font-semibold text-stone-500 hover:text-[#d36343] disabled:opacity-50 dark:text-stone-300">← Edit contact details</button>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#c35e3e]">Order summary</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">Rank #{primaryRank} listing</h3>
          <p className="mt-2 break-all text-sm text-stone-600 dark:text-stone-300">{target}</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{selectedCategory}</p>
          <div className="mt-6 space-y-4 border-t border-stone-200 pt-5 text-sm dark:border-white/10">
            <div className="flex justify-between gap-3"><span className="text-stone-500 dark:text-stone-400">Ranking bid (USD)</span><strong className="text-stone-900 dark:text-white">{money(bidAmount)}</strong></div>
            {quoted && <div className="flex justify-between gap-3"><span className="text-stone-500 dark:text-stone-400">Conversion rate</span><strong className="text-stone-900 dark:text-white">1 USD = {inr(previewQuote.exchangeRate)}</strong></div>}
            <div className="flex justify-between gap-3 border-t border-stone-200 pt-4 dark:border-white/10"><span className="font-semibold text-stone-700 dark:text-stone-200">Payable in INR</span><strong className="text-xl text-[#c35e3e]">{paymentAmountInr !== null ? inr(paymentAmountInr) : quoted ? inr(previewQuote.amountInr) : "At checkout"}</strong></div>
          </div>
          <p className="mt-5 text-xs leading-5 text-stone-500 dark:text-stone-400">All customers are charged in INR. Your bank may apply its own currency conversion for an international card.</p>
        </aside>
        <div>
          <StepHeader step={3} title="Choose how to pay" description="Select a payment method. The final charge is in INR." onClose={() => !loading && setShowPayment(false)} disabled={loading} />
          <div className="space-y-4 px-5 py-5 sm:px-8">
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-200">Payment options</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {paymentMethods.map((method) => <label key={method.id} className={`flex items-center gap-3 rounded-xl border p-3 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-orange-500 ${paymentMethod === method.id ? "border-[#ed7656] bg-[#fff6f1] dark:bg-[#ed7656]/10" : "border-stone-200 bg-white hover:border-[#edc9b9] dark:border-white/15 dark:bg-white/5"} ${loading || !methodEnabled(method.id) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                  <input type="radio" name="payment-method" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} disabled={loading || !methodEnabled(method.id)} className="sr-only" />
                  <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${paymentMethod === method.id ? "bg-[#fce5db] text-[#c35e3e] dark:bg-white/10" : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300"}`}>{method.icon}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-stone-900 dark:text-white">{method.title}</span><span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">{methodStatus.state === "ready" && !methodEnabled(method.id) ? "Not enabled on this account" : method.subtitle}</span></span>
                  <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${paymentMethod === method.id ? "border-[#ed7656]" : "border-stone-300 dark:border-stone-600"}`}>{paymentMethod === method.id && <span className="h-2 w-2 rounded-full bg-[#ed7656]" />}</span>
                </label>)}
              </div>
            </fieldset>
            {methodStatus.state === "loading" && <p role="status" className="text-sm text-stone-500 dark:text-stone-400">Checking available payment methods…</p>}
            {methodStatus.state === "error" && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">Could not verify payment methods. You can view available methods in Razorpay, or <button type="button" onClick={() => { setMethodStatus({ state: "loading", methods: null }); setMethodRetry((value) => value + 1); }} className="font-semibold underline">retry</button>.</div>}
            {methodStatus.state === "ready" && !methodEnabled(paymentMethod) && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">{selectedPaymentMethod.title} is not enabled for this Razorpay account. Choose another method or enable it in Razorpay Dashboard → Settings → Payment Methods.</div>}
            {methodEnabled(paymentMethod) && <div className="rounded-xl border border-[#f0d9ce] bg-[#fffaf7] px-4 py-3 dark:border-white/10 dark:bg-white/5"><p className="text-sm font-semibold text-stone-900 dark:text-white">{selectedPaymentMethod.title}</p><p className="mt-1 text-xs leading-5 text-stone-600 dark:text-stone-300">{selectedPaymentMethod.detail}</p></div>}
            <button type="button" disabled={loading || !methodEnabled(paymentMethod)} onClick={() => handleRazorpayPayment(paymentMethod)} className={`${primaryButton} w-full`}>{loading ? "Opening secure checkout…" : paymentMethod === "other" ? "See all payment options →" : `Continue with ${selectedPaymentMethod.title} →`}</button>
            {pendingOrder && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">{paymentStatus === "unavailable" ? "We could not check the earlier order yet. Please check its status before paying again." : "Your earlier order will be reused. If the bank has already charged you, check status before retrying."}</p>}
            {paymentError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{paymentError}</p>}
            <p className="text-center text-xs leading-5 text-stone-500 dark:text-stone-400">Secure payment by Razorpay. Confirm the final INR amount before paying.</p>
          </div>
        </div>
      </div>
    </Dialog>}

    {showSuccess && <Dialog labelledBy="success-title">
      <div className="px-6 py-8 text-center sm:px-8"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">✓</div><h2 id="success-title" className="mt-5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">You're on the board!</h2><p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">Your payment was verified and your listing is live.</p>
        <div className="mt-6 rounded-2xl bg-[#fff4ed] p-6 dark:bg-white/5"><p className="text-xs font-bold uppercase tracking-widest text-[#b55d40]">Listing status</p><p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Live on the board</p><p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Current position may change as new bids arrive.</p><div className="mt-5 border-t border-[#f0d9ce] pt-4 text-sm dark:border-white/10"><span className="text-stone-500">Your bid</span><strong className="ml-3 text-stone-900 dark:text-white">{money(successData.amount)}</strong></div></div>
        <div className="mt-4 rounded-xl border border-stone-200 p-4 text-left text-sm dark:border-white/10"><p className="break-all font-semibold text-stone-900 dark:text-white">{successData.target}</p><p className="mt-1 text-stone-500 dark:text-stone-400">{successData.category}</p></div>
        <button type="button" onClick={closeSuccess} className={`${primaryButton} mt-6 w-full`}>Explore the board →</button>
      </div>
    </Dialog>}
  </>;
}

export default ClaimRankUI;

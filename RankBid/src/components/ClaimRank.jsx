import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../config";
import ClaimRankUI from "./ClaimRankUI";

const PENDING_PAYMENT_KEY = "rankbid_pending_payment_v1";

function readPendingPayment() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PENDING_PAYMENT_KEY) || "null");
    return saved?.orderId && saved?.claimId && saved?.keyId ? saved : null;
  } catch {
    return null;
  }
}

function ClaimRank({
  category = "",
  categorySlug = "",
  period: externalPeriod = null,
  onPeriodChange = null,
  hidePeriodToggle = false,
}) {
  const location = useLocation();
  const incomingDraft = location.state?.rankBidDraft;
  // ========================================
  // MINIMUM BID
  // ========================================

  const MIN_BID = 1;

  // ========================================
  // BASIC STATES
  // ========================================

  const [target, setTarget] = useState(() => incomingDraft?.target || "");

  const [selectedCategory, setSelectedCategory] =
    useState(category || "");

  const [claims, setClaims] = useState([]);
  const [claimsFetched, setClaimsFetched] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [globalClaims, setGlobalClaims] = useState(null);

  const [internalPeriod, setInternalPeriod] = useState("all");

  const period =
    externalPeriod !== null
      ? externalPeriod
      : internalPeriod;

  useLayoutEffect(() => {
    const requestedPeriod = new URLSearchParams(location.search).get("period");
    if ((incomingDraft?.period === "today" || requestedPeriod === "today") && period !== "today") {
      if (onPeriodChange) onPeriodChange("today");
      else setInternalPeriod("today");
    }
  }, [incomingDraft?.period, location.search, onPeriodChange, period]);

  const [bidAmount, setBidAmount] =
    useState(() => incomingDraft?.bidWasAdjusted
      ? Math.max(MIN_BID, Number(incomingDraft.bidAmount) || MIN_BID)
      : MIN_BID);
  const hasChosenBidRef = useRef(Boolean(incomingDraft?.bidWasAdjusted));
  const hasUserAdjustedBidRef = useRef(Boolean(incomingDraft?.bidWasAdjusted));

  const [, setCalculatedRank] =
    useState(1);

  const [todayRank, setTodayRank] =
    useState(1);

  const [allTimeRank, setAllTimeRank] =
    useState(1);

  const [showConfirm, setShowConfirm] =
    useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  const [showPayment, setShowPayment] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);
  const [rankingError, setRankingError] = useState(false);

  const [countdown, setCountdown] =
    useState("00:00:00");

  const [paymentAmountInr, setPaymentAmountInr] =
    useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [pendingOrder, setPendingOrder] = useState(readPendingPayment);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  const [previewQuote, setPreviewQuote] = useState(null);

  const [successData, setSuccessData] =
    useState({
      todayRank: 1,
      allTimeRank: 1,
      amount: MIN_BID,
      category: "",
      target: "",
    });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "India",
    zipCode: "",
    isBusiness: false,
  });

  function clearPendingPayment() {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    setPendingOrder(null);
    setPaymentStatus("pending");
  }

  async function checkPendingPayment(order = pendingOrder) {
    if (!order) return;
    setPaymentStatus("checking");
    try {
      const response = await fetch(`${API_URL}/api/payments/status/${encodeURIComponent(order.orderId)}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Status unavailable");
      if (JSON.parse(sessionStorage.getItem(PENDING_PAYMENT_KEY) || "null")?.orderId !== order.orderId) return;
      if (data.status === "paid") {
        clearPendingPayment();
        setSuccessData({
          todayRank: null,
          allTimeRank: null,
          amount: data.claim.amountUsd,
          category: data.claim.category,
          target: data.claim.target,
        });
        setShowPayment(false);
        setShowDetails(false);
        setShowConfirm(false);
        setShowSuccess(true);
      } else {
        setPaymentStatus("pending");
      }
    } catch {
      setPaymentStatus("unavailable");
    }
  }

  useEffect(() => {
    if (!pendingOrder) return undefined;
    checkPendingPayment(pendingOrder);
    const interval = setInterval(() => checkPendingPayment(pendingOrder), 8000);
    return () => clearInterval(interval);
    // The order ID is the only value that should restart polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOrder?.orderId]);

  function resumePendingPayment() {
    if (!pendingOrder) return;
    setTarget(pendingOrder.target);
    setSelectedCategory(pendingOrder.category);
    setBidAmount(pendingOrder.amountUsd);
    setPaymentAmountInr(pendingOrder.amountInr);
    setPaymentError("");
    setShowDetails(true);
  }

  // ========================================
  // CATEGORIES
  // ========================================

  const categories = [
    {
      name: "AI Agents & Infrastructure",
      slug: "ai-agents-and-infrastructure",
    },
    {
      name: "SEO & AI Visibility",
      slug: "seo-and-ai-visibility",
    },
    {
      name: "Marketing & Advertising",
      slug: "marketing-and-advertising",
    },
    {
      name: "Analytics",
      slug: "analytics",
    },
    {
      name: "Crypto, Web3 & Investing",
      slug: "crypto-web3-and-investing",
    },
    {
      name: "Developer Tools",
      slug: "developer-tools",
    },
    {
      name: "Business, Finance & Legal",
      slug: "business-finance-and-legal",
    },
    {
      name: "Security, Privacy & Compliance",
      slug: "security-privacy-and-compliance",
    },
    {
      name: "Health, Fitness & Wellness",
      slug: "health-fitness-and-wellness",
    },
    {
      name: "Social Media & Creator Tools",
      slug: "social-media-and-creator-tools",
    },
    {
      name: "Leaderboards & Attention Markets",
      slug: "leaderboards-and-attention-markets",
    },
    {
      name: "Hiring, Jobs & Careers",
      slug: "hiring-jobs-and-careers",
    },
    {
      name: "Education & Learning",
      slug: "education-and-learning",
    },
    {
      name: "Agencies, Studios & Services",
      slug: "agencies-studios-and-services",
    },
    {
      name: "Ecommerce & Retail",
      slug: "ecommerce-and-retail",
    },
    {
      name: "Domains & Web Assets",
      slug: "domains-and-web-assets",
    },
    {
      name: "Games & Entertainment",
      slug: "games-and-entertainment",
    },
    {
      name: "People & Profiles",
      slug: "people-and-profiles",
    },
    {
      name: "Productivity & Personal Tools",
      slug: "productivity-and-personal-tools",
    },
    {
      name: "Design & Creative",
      slug: "design-and-creative",
    },
    {
      name: "Writing & Content",
      slug: "writing-and-content",
    },
    {
      name: "Directories, Launch & Discovery",
      slug: "directories-launch-and-discovery",
    },
    {
      name: "AI Media Generation",
      slug: "ai-media-generation",
    },
    {
      name: "Audio, Voice & Podcasting",
      slug: "audio-voice-and-podcasting",
    },
    {
      name: "Sales & Lead Generation",
      slug: "sales-and-lead-generation",
    },
    {
      name: "Travel, Local & Lifestyle",
      slug: "travel-local-and-lifestyle",
    },
    {
      name: "Real Estate & Property",
      slug: "real-estate-and-property",
    },
    {
      name: "Media & News",
      slug: "media-and-news",
    },
    {
      name: "Other",
      slug: "other",
    },
  ];

  const currentCategory =
    categories.find(
      (item) => item.name === selectedCategory
    ) || null;

  // ========================================
  // UTC COUNTDOWN
  // ========================================

  function getUtcCountdown() {
    const now = new Date();

    const nextMidnightUtc = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0,
        0,
        0
      )
    );

    const difference =
      nextMidnightUtc.getTime() -
      now.getTime();

    const totalSeconds = Math.max(
      0,
      Math.floor(difference / 1000)
    );

    const hours =
      Math.floor(totalSeconds / 3600);

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  useEffect(() => {
    function updateCountdown() {
      setCountdown(
        getUtcCountdown()
      );
    }

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ========================================
  // CHECK TODAY USING UTC
  // ========================================

  function isToday(dateValue) {
    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);
    const now = new Date();

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return (
      date.getUTCFullYear() ===
        now.getUTCFullYear() &&
      date.getUTCMonth() ===
        now.getUTCMonth() &&
      date.getUTCDate() ===
        now.getUTCDate()
    );
  }

  // ========================================
  // CLAIM FILTERS
  // ========================================

  const todayClaims = useMemo(() => {
    return claims.filter((claim) =>
      isToday(claim.paid_at || claim.created_at)
    );
  }, [claims]);

  const allTimeClaims = useMemo(() => {
    return claims;
  }, [claims]);

  const periodClaims = useMemo(() => {
    return period === "today"
      ? todayClaims
      : allTimeClaims;
  }, [
    period,
    todayClaims,
    allTimeClaims,
  ]);

  // ========================================
  // CURRENT TOP AMOUNT
  // ========================================

  const currentTopAmount = useMemo(() => {
    if (periodClaims.length === 0) {
      return 0;
    }

    return Math.max(
      ...periodClaims.map(
        (claim) =>
          Number(claim.amount) || 0
      )
    );
  }, [periodClaims]);

  // ========================================
  // CALCULATE RANK
  // ========================================

  function calculateRank(
    amount,
    existingClaims
  ) {
    const numericAmount =
      Number(amount);

    return (
      existingClaims.filter(
        (claim) =>
          Number(claim.amount) >=
          numericAmount
      ).length + 1
    );
  }

  function calculateBothRanks(
    amount,
    existingClaims
  ) {
    const numericAmount =
      Number(amount);

    const todayClaimsForRank =
      existingClaims.filter(
        (claim) =>
          isToday(claim.paid_at || claim.created_at)
      );

    const allTimeClaimsForRank =
      existingClaims;

    return {
      todayRank: calculateRank(
        numericAmount,
        todayClaimsForRank
      ),

      allTimeRank: calculateRank(
        numericAmount,
        allTimeClaimsForRank
      ),
    };
  }

  function updateCalculatedRanks(
    amount,
    existingClaims = claims
  ) {
    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      )
    ) {
      return;
    }

    const {
      todayRank: newTodayRank,
      allTimeRank: newAllTimeRank,
    } = calculateBothRanks(
      numericAmount,
      existingClaims
    );

    setTodayRank(
      newTodayRank
    );

    setAllTimeRank(
      newAllTimeRank
    );

    if (period === "today") {
      setCalculatedRank(
        newTodayRank
      );
    } else {
      setCalculatedRank(
        newAllTimeRank
      );
    }
  }

  // ========================================
  // LOAD CLAIMS
  // ========================================

  const loadClaims = useCallback(async (throwOnError = false) => {
    try {
      const url = categorySlug
        ? `${API_URL}/api/claims/category/${categorySlug}`
        : `${API_URL}/api/claims`;

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Could not load current rankings"
        );
      }

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Could not load current rankings"
        );
      }

      setRankingError(false);
      return data.claims || [];
    } catch (error) {
      console.error(
        "Ranking fetch error:",
        error
      );

      setRankingError(true);
      if (throwOnError) throw error;
      return [];
    }
  }, [categorySlug]);

  const loadGlobalClaims = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/claims`);
    if (!response.ok) throw new Error("Could not load all-time rankings");
    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Could not load all-time rankings");
    return data.claims || [];
  }, []);

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    let active = true;
    loadClaims().then((existingClaims) => {
      if (active) {
        setClaims(existingClaims);
        setClaimsFetched(true);
      }
    });
    return () => { active = false; };
  }, [loadClaims]);

  useEffect(() => {
    if (!categorySlug) return undefined;
    let active = true;
    loadGlobalClaims()
      .then((allClaims) => { if (active) setGlobalClaims(allClaims); })
      .catch((error) => {
        console.error("All-time rank fetch error:", error);
        if (active) setGlobalClaims(null);
      });
    return () => { active = false; };
  }, [categorySlug, loadGlobalClaims]);

  // ========================================
  // UPDATE WHEN PERIOD CHANGES
  // ========================================

  useEffect(() => {
    if (!claimsFetched) return;
    const amount = hasChosenBidRef.current
      ? Math.max(MIN_BID, Number(bidAmount) || MIN_BID)
      : currentTopAmount >= MIN_BID
        ? currentTopAmount + 1
        : MIN_BID;

    if (!hasChosenBidRef.current) setBidAmount(amount);

    const ranks =
      calculateBothRanks(
        amount,
        claims
      );

    setTodayRank(
      ranks.todayRank
    );

    setAllTimeRank(
      ranks.allTimeRank
    );

    setCalculatedRank(
      period === "today"
        ? ranks.todayRank
        : ranks.allTimeRank
    );
    setRankingLoading(false);
  }, [
    claimsFetched,
    period,
    currentTopAmount,
    claims,
    bidAmount,
  ]);

  // ========================================
  // BID CONTROLS
  // ========================================

  useEffect(() => {
    const controller = new AbortController();
    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount < MIN_BID) return () => controller.abort();

    fetch(`${API_URL}/api/payments/quote?amountUsd=${encodeURIComponent(amount)}`, {
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!controller.signal.aborted) setPreviewQuote(data?.success ? data : { error: true, amountUsd: amount });
      })
      .catch(() => {
        if (!controller.signal.aborted) setPreviewQuote({ error: true, amountUsd: amount });
      });

    return () => controller.abort();
  }, [bidAmount]);

  function updateBidAmount(
    nextAmount
  ) {
    const numericAmount =
      Math.max(
        MIN_BID,
        Number(nextAmount) ||
          MIN_BID
      );

    hasChosenBidRef.current = true;
    hasUserAdjustedBidRef.current = true;
    setBidAmount(
      numericAmount
    );

    setPaymentAmountInr(null);

    updateCalculatedRanks(
      numericAmount,
      claims
    );
  }

  function increaseBid() {
    updateBidAmount(
      Number(bidAmount) + 1
    );
  }

  function decreaseBid() {
    updateBidAmount(
      Math.max(
        MIN_BID,
        Number(bidAmount) - 1
      )
    );
  }

  // ========================================
  // PERIOD CHANGE
  // ========================================

  function handlePeriodChange(
    nextPeriod
  ) {
    if (onPeriodChange) {
      onPeriodChange(
        nextPeriod
      );
    } else {
      setInternalPeriod(
        nextPeriod
      );
    }
  }

  // ========================================
  // CLAIM BUTTON
  // ========================================

  async function retryRankings() {
    setLoading(true);
    try {
      const existingClaims = await loadClaims(true);
      setClaims(existingClaims);
      updateCalculatedRanks(bidAmount, existingClaims);
    } catch (error) {
      console.error("Ranking retry error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimClick() {
    if (!target.trim()) {
      alert(
        "Please enter your product URL or @handle."
      );
      return;
    }

    if (!selectedCategory) {
      alert(
        "Please choose a category."
      );
      return;
    }

    const slug =
      currentCategory?.slug ||
      categorySlug;

    if (!slug) {
      alert(
        "Category is missing."
      );
      return;
    }

    hasChosenBidRef.current = true;
    setLoading(true);

    try {
      const [existingClaims, allClaims] = await Promise.all([
        loadClaims(true),
        categorySlug ? loadGlobalClaims().catch((error) => {
          console.error("All-time rank fetch error:", error);
          return null;
        }) : Promise.resolve(null),
      ]);

      setClaims(existingClaims);
      if (categorySlug) setGlobalClaims(allClaims);

      // Keep the amount the visitor selected in the live preview.
      const amount = Math.max(MIN_BID, Number(bidAmount) || MIN_BID);

      const ranks =
        calculateBothRanks(
          amount,
          existingClaims
        );

      setTodayRank(
        ranks.todayRank
      );

      setAllTimeRank(
        ranks.allTimeRank
      );

      setCalculatedRank(
        period === "today"
          ? ranks.todayRank
          : ranks.allTimeRank
      );

      setShowConfirm(
        true
      );
      setTermsAccepted(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // FORM UPDATE
  // ========================================

  function updateForm(
    field,
    value
  ) {
    setDetailsError("");
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // ========================================
  // MODAL NAVIGATION
  // ========================================

  function continueToDetails() {
    if (!termsAccepted) return;
    setShowConfirm(false);
    setShowDetails(true);
  }

  function backToConfirm() {
    setShowDetails(false);
    setShowConfirm(true);
  }

  function continueToPayment() {
    if (!form.fullName.trim()) {
      setDetailsError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setDetailsError("Please enter a valid email address.");
      return;
    }

    if (!form.country.trim()) {
      setDetailsError("Please enter your country.");
      return;
    }

    setShowDetails(false);
    setDetailsError("");
    setPaymentError("");
    setShowPayment(true);
  }

  function backToDetails() {
    if (!loading) {
      setShowPayment(false);
      setShowDetails(true);
    }
  }

  // ========================================
  // LOAD RAZORPAY CHECKOUT
  // ========================================

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script
      );
    });
  }

  // ========================================
  // RAZORPAY PAYMENT
  // ========================================

  async function handleRazorpayPayment(selectedMethod = "upi") {
    setPaymentError("");
    if (!form.fullName.trim()) {
      setPaymentError("Please enter your full name in contact details.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setPaymentError("Please enter a valid email in contact details.");
      return;
    }

    if (!form.country.trim()) {
      setPaymentError("Please enter your country in contact details.");
      return;
    }

    if (
      Number(bidAmount) <
      MIN_BID
    ) {
      setPaymentError(`Bid cannot be lower than $${MIN_BID}.`);
      return;
    }

    setLoading(true);

    try {
      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded."
        );
      }

      if (["upi", "card", "netbanking"].includes(selectedMethod)) {
        const methodsResponse = await fetch(`${API_URL}/api/payments/methods`);
        const methodsData = await methodsResponse.json();
        if (!methodsResponse.ok || !methodsData.success || !methodsData.methods?.[selectedMethod]) {
          throw new Error(`${selectedMethod === "upi" ? "UPI" : selectedMethod === "card" ? "Card" : "Netbanking"} is not enabled for this Razorpay account. Choose another payment method.`);
        }
      }

      let claimId;
      let orderData;
      const listingCategory = currentCategory?.name || selectedCategory;

      if (pendingOrder) {
        if (pendingOrder.target !== target.trim() ||
            pendingOrder.category !== listingCategory ||
            Number(pendingOrder.amountUsd) !== Number(bidAmount)) {
          throw new Error("An earlier payment is still pending. Resume it or clear it before starting another listing.");
        }
        const statusResponse = await fetch(`${API_URL}/api/payments/status/${encodeURIComponent(pendingOrder.orderId)}`);
        const statusData = await statusResponse.json();
        if (!statusResponse.ok || !statusData.success) {
          throw new Error("Could not check your previous payment. Please try again before paying.");
        }
        if (statusData.status === "paid") {
          await checkPendingPayment(pendingOrder);
          setLoading(false);
          return;
        }
        claimId = pendingOrder.claimId;
        orderData = {
          keyId: pendingOrder.keyId,
          order: { id: pendingOrder.orderId, amount: pendingOrder.amountPaise, currency: "INR" },
          amountInr: pendingOrder.amountInr,
        };
      } else {
      // Create a pending claim and one INR order for this listing.
      const claimResponse =
        await fetch(
          `${API_URL}/api/claims`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              target:
                target.trim(),

              categorySlug:
                currentCategory?.slug ||
                categorySlug,

              amount:
                Number(bidAmount),

              user: {
                fullName:
                  form.fullName.trim(),

                email:
                  form.email
                    .trim()
                    .toLowerCase(),

                phone:
                  form.phone.trim(),

                country:
                  form.country.trim(),

                zipCode:
                  form.zipCode.trim(),

                isBusiness:
                  form.isBusiness,
              },
            }),
          }
        );

      const claimData =
        await claimResponse.json();

      if (
        !claimResponse.ok ||
        !claimData.success
      ) {
        throw new Error(
          claimData.message ||
            "Could not create claim"
        );
      }

      claimId =
        claimData.claim?.id;

      if (!claimId) {
        throw new Error(
          "Claim ID was not returned by the server."
        );
      }

      // ========================================
      // 2. CREATE RAZORPAY ORDER
      // ========================================

      const orderResponse =
        await fetch(
          `${API_URL}/api/payments/create-order`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              claimId,
            }),
          }
        );

      orderData =
        await orderResponse.json();

      if (
        !orderResponse.ok ||
        !orderData.success
      ) {
        throw new Error(
          orderData.message ||
            "Could not create payment order"
        );
      }

      const order =
        orderData.order;

      if (!orderData.keyId || !order?.id || order.currency !== "INR") {
        throw new Error("Razorpay checkout is not configured correctly.");
      }

      const savedOrder = {
        orderId: order.id,
        claimId,
        keyId: orderData.keyId,
        amountPaise: order.amount,
        amountInr: orderData.amountInr,
        amountUsd: Number(bidAmount),
        target: target.trim(),
        category: listingCategory,
      };
      sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(savedOrder));
      setPendingOrder(savedOrder);
      }

      const order = orderData.order;
      if (!orderData.keyId || !order?.id || !Number.isInteger(Number(order.amount)) || order.currency !== "INR") {
        throw new Error("Payment order is unavailable. Please check its status before trying again.");
      }

      setPaymentAmountInr(
        orderData.amountInr
      );


      // ========================================
      // 3. OPEN RAZORPAY CHECKOUT
      // ========================================

      const preferredMethod = ["upi", "card", "netbanking"].includes(selectedMethod)
        ? selectedMethod
        : null;

      const options = {
        key:
          orderData.keyId,

        amount:
          order.amount,

        currency:
          order.currency,

        name:
          "RankBid.lol",

        description:
          `Rank claim for ${target.trim()}`,

        order_id:
          order.id,

        prefill: {
          name:
            form.fullName.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          contact:
            form.phone.trim(),
        },

        notes: {
          claim_id:
            String(claimId),

          target:
            target.trim(),

          category:
            currentCategory?.name ||
            selectedCategory,
        },

        theme: {
          color:
            "#ed7656",
        },

        ...(preferredMethod ? {
          config: {
            display: {
              blocks: {
                preferred: {
                  name: `Pay via ${preferredMethod === "upi" ? "UPI" : preferredMethod === "card" ? "card" : "netbanking"}`,
                  instruments: [{ method: preferredMethod }],
                },
              },
              sequence: ["block.preferred"],
              preferences: { show_default_blocks: false },
            },
          },
        } : {}),

        handler:
          async function (
            response
          ) {
            try {
              const verifyResponse =
                await fetch(
                  `${API_URL}/api/payments/verify`,
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({
                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,
                    }),
                  }
                );

              const verifyData =
                await verifyResponse.json();

              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {
                throw new Error(
                  verifyData.message ||
                    "Payment verification failed"
                );
              }

              setSuccessData({
                todayRank:
                  verifyData.todayRank ??
                  todayRank,

                allTimeRank:
                  verifyData.allTimeRank ??
                  allTimeRank,

                amount:
                  Number(
                    bidAmount
                  ),

                category:
                  currentCategory?.name ||
                  selectedCategory,

                target:
                  target.trim(),
              });

              clearPendingPayment();

              setShowPayment(
                false
              );

              setShowSuccess(
                true
              );
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );
              setPaymentError(error.message || "Payment verification failed. Please contact support with your payment ID.");
            } finally {
              setLoading(false);
            }
          },

        modal: {
          ondismiss:
            function () {
              setLoading(false);
            },
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (
          response
        ) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setLoading(false);
          const description = response?.error?.description || "Payment failed. Please try again.";
          setPaymentError(/international cards? (are|is) not supported/i.test(description)
            ? "International cards are not enabled for this store yet. Please try an Indian card or another payment method."
            : description);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setLoading(false);
      setPaymentError(error.message || "Could not start payment. Please try again.");
    }
  }

  // ========================================
  // HEADING / RANK
  // ========================================

  const primaryRank =
    period === "today"
      ? todayRank
      : allTimeRank;
  const allBoardClaims = categorySlug ? globalClaims : claims;
  const globalAllTimeRank = allBoardClaims === null
    ? null
    : calculateRank(bidAmount, allBoardClaims);

  // ========================================
  // UI
  // ========================================

  return (
    <ClaimRankUI
      hidePeriodToggle={hidePeriodToggle}
      period={period}
      countdown={countdown}
      handlePeriodChange={handlePeriodChange}
      primaryRank={primaryRank}
      rankingLoading={rankingLoading}
      bidWasAdjusted={hasUserAdjustedBidRef.current}
      globalAllTimeRank={globalAllTimeRank}
      showGlobalRank={Boolean(categorySlug) || period === "today"}
      rankingError={rankingError}
      bidAmount={bidAmount}
      MIN_BID={MIN_BID}
      decreaseBid={decreaseBid}
      increaseBid={increaseBid}
      target={target}
      setTarget={setTarget}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      categories={categories}
      category={category}
      handleClaimClick={handleClaimClick}
      retryRankings={retryRankings}
      loading={loading}
      showConfirm={showConfirm}
      setShowConfirm={setShowConfirm}
      termsAccepted={termsAccepted}
      setTermsAccepted={setTermsAccepted}
      continueToDetails={continueToDetails}
      todayRank={todayRank}
      allTimeRank={allTimeRank}
      claims={claims}
      updateCalculatedRanks={updateCalculatedRanks}
      setBidAmount={setBidAmount}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      form={form}
      detailsError={detailsError}
      updateForm={updateForm}
      backToConfirm={backToConfirm}
      continueToPayment={continueToPayment}
      showPayment={showPayment}
      setShowPayment={setShowPayment}
      backToDetails={backToDetails}
      handleRazorpayPayment={handleRazorpayPayment}
      paymentAmountInr={paymentAmountInr}
      paymentError={paymentError}
      pendingOrder={pendingOrder}
      paymentStatus={paymentStatus}
      checkPendingPayment={checkPendingPayment}
      resumePendingPayment={resumePendingPayment}
      clearPendingPayment={clearPendingPayment}
      previewQuote={previewQuote}
      showSuccess={showSuccess}
      successData={successData}
      closeSuccess={() => {
        setShowSuccess(false);
        setShowConfirm(false);
        setShowDetails(false);
        setShowPayment(false);
        setTarget("");
        setSelectedCategory(
          category || ""
        );
        setForm({
          fullName: "",
          email: "",
          phone: "",
          country: "India",
          zipCode: "",
          isBusiness: false,
        });
        setPaymentAmountInr(null);
      }}
    />
  );
}

export default ClaimRank;

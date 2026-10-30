import { useState } from "react";
import ClaimRank from "../../components/ClaimRank";
import ClaimListings from "../../components/ClaimListings";

function HiringJobsCareers() {
  const category = "Hiring, Jobs & Careers";

  const categorySlug =
    "hiring-jobs-and-careers";

  const [period, setPeriod] = useState("all");

  return (
    <main className="w-full">
      {/* ========================================
          CLAIM RANK
          Toggle + IST countdown are handled
          inside ClaimRank
      ======================================== */}

      <ClaimRank
        category={category}
        categorySlug={categorySlug}
        period={period}
        onPeriodChange={setPeriod}
        hidePeriodToggle={false}
      />

      {/* ========================================
          CATEGORY LISTINGS
      ======================================== */}

      <ClaimListings
        categorySlug={categorySlug}
        period={period}
      />
    </main>
  );
}

export default HiringJobsCareers;
import { useState } from "react";
import ClaimRank from "../../components/ClaimRank";
import ClaimListings from "../../components/ClaimListings";

function LeaderboardsAttentionMarkets() {
  const category = "Leaderboards & Attention Markets";
  const categorySlug = "leaderboards-and-attention-markets";
  const [period, setPeriod] = useState("all");

  return (
    <main className="w-full">
      <ClaimRank
        category={category}
        categorySlug={categorySlug}
        period={period}
        onPeriodChange={setPeriod}
        hidePeriodToggle={false}
      />
      <ClaimListings categorySlug={categorySlug} period={period} />
    </main>
  );
}

export default LeaderboardsAttentionMarkets;

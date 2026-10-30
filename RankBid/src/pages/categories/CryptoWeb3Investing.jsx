import { useState } from "react";
import ClaimRank from "../../components/ClaimRank";
import ClaimListings from "../../components/ClaimListings";

function CryptoWeb3Investing() {
  const category = "Crypto, Web3 & Investing";

  const categorySlug =
    "crypto-web3-and-investing";

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

export default CryptoWeb3Investing;
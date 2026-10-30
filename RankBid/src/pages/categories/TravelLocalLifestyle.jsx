import { useState } from "react";
import ClaimRank from "../../components/ClaimRank";
import ClaimListings from "../../components/ClaimListings";

function TravelLocalLifestyle() {
  const category = "Travel, Local & Lifestyle";
  const categorySlug = "travel-local-and-lifestyle";
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

export default TravelLocalLifestyle;

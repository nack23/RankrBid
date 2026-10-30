import { useState } from "react";
import ClaimRank from "../../components/ClaimRank";
import ClaimListings from "../../components/ClaimListings";

function RealEstateProperty() {
  const category = "Real Estate & Property";
  const categorySlug = "real-estate-and-property";
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

export default RealEstateProperty;

import { useState } from "react";
import ClaimRank from "../../components/ClaimRank";
import ClaimListings from "../../components/ClaimListings";

function ProductivityPersonalTools() {
  const category = "Productivity & Personal Tools";
  const categorySlug = "productivity-and-personal-tools";
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

export default ProductivityPersonalTools;

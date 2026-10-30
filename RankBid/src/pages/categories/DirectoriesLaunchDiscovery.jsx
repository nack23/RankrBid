import { useState } from "react";
import ClaimRank from "../../components/ClaimRank";
import ClaimListings from "../../components/ClaimListings";

function DirectoriesLaunchDiscovery() {
  const category = "Directories, Launch & Discovery";
  const categorySlug = "directories-launch-and-discovery";
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

export default DirectoriesLaunchDiscovery;

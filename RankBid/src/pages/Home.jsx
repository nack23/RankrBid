import { useState } from "react";
import ClaimRank from "../components/ClaimRank";
import ClaimListings from "../components/ClaimListings";

function Home() {
  const [period, setPeriod] = useState(() => new URLSearchParams(window.location.search).get("period") === "today" ? "today" : "all");

  return (
    <main>
      <ClaimRank
        period={period}
        onPeriodChange={setPeriod}
      />

      <ClaimListings
        period={period}
      />
    </main>
  );
}

export default Home;

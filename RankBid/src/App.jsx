import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";

import Home from "./pages/Home";
import AiAgentsInfrastructure from "./pages/categories/AiAgentsInfrastructure";
import SeoAiVisibility from "./pages/categories/SeoAiVisibility";
import MarketingAdvertising from "./pages/categories/MarketingAdvertising";
import Analytics from "./pages/categories/Analytics";
import CryptoWeb3Investing from "./pages/categories/CryptoWeb3Investing";
import DeveloperTools from "./pages/categories/DeveloperTools";
import BusinessFinanceLegal from "./pages/categories/BusinessFinanceLegal";
import SecurityPrivacyCompliance from "./pages/categories/SecurityPrivacyCompliance";
import HealthFitnessWellness from "./pages/categories/HealthFitnessWellness";
import SocialMediaCreatorTools from "./pages/categories/SocialMediaCreatorTools";
import LeaderboardsAttentionMarkets from "./pages/categories/LeaderboardsAttentionMarkets";
import HiringJobsCareers from "./pages/categories/HiringJobsCareers";
import EducationLearning from "./pages/categories/EducationLearning";
import AgenciesStudiosServices from "./pages/categories/AgenciesStudiosServices";
import EcommerceRetail from "./pages/categories/EcommerceRetail";
import DomainsWebAssets from "./pages/categories/DomainsWebAssets";
import GamesEntertainment from "./pages/categories/GamesEntertainment";
import PeopleProfiles from "./pages/categories/PeopleProfiles";
import ProductivityPersonalTools from "./pages/categories/ProductivityPersonalTools";
import DesignCreative from "./pages/categories/DesignCreative";
import WritingContent from "./pages/categories/WritingContent";
import DirectoriesLaunchDiscovery from "./pages/categories/DirectoriesLaunchDiscovery";
import AiMediaGeneration from "./pages/categories/AiMediaGeneration";
import AudioVoicePodcasting from "./pages/categories/AudioVoicePodcasting";
import SalesLeadGeneration from "./pages/categories/SalesLeadGeneration";
import TravelLocalLifestyle from "./pages/categories/TravelLocalLifestyle";
import RealEstateProperty from "./pages/categories/RealEstateProperty";
import MediaNews from "./pages/categories/MediaNews";
import Other from "./pages/categories/Other";
import Daily from "./pages/Daily";
import Categories from "./pages/Categories";
import Explore from "./pages/Explore";
import About from "./pages/About";
import Rules from "./pages/Rules";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Stats from "./pages/Stats";
import ClaimDetails from "./pages/ClaimDetails";

function PageCategoryBar() {
  const { pathname } = useLocation();
  return ["/categories", "/daily", "/about", "/rules"].includes(pathname) || pathname.startsWith("/product/") ? null : <CategoryBar />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fbfaf8] text-gray-900 dark:bg-[#1b1714] dark:text-[#f7f2ef]">

        {/* Category navigation stays on ranking pages; listing details use a breadcrumb. */}
        <Navbar />
        <PageCategoryBar />

        <Routes>

          {/* Home / "All" */}
          <Route path="/" element={<Home />} />

          {/* One dedicated page per category pill — each file under
              src/pages/categories/ is independent, so backend data can be
              wired up per category without touching the others. */}
          <Route path="/category/ai-agents-and-infrastructure" element={<AiAgentsInfrastructure />} />

          <Route path="/category/seo-and-ai-visibility" element={<SeoAiVisibility />} />

          <Route path="/category/marketing-and-advertising" element={<MarketingAdvertising />} />

          <Route path="/category/analytics" element={<Analytics />} />

          <Route path="/category/crypto-web3-and-investing" element={<CryptoWeb3Investing />} />

          <Route path="/category/developer-tools" element={<DeveloperTools />} />

          <Route path="/category/business-finance-and-legal" element={<BusinessFinanceLegal />} />

          <Route path="/category/security-privacy-and-compliance" element={<SecurityPrivacyCompliance />} />

          <Route path="/category/health-fitness-and-wellness" element={<HealthFitnessWellness />} />

          <Route path="/category/social-media-and-creator-tools" element={<SocialMediaCreatorTools />} />

          <Route path="/category/leaderboards-and-attention-markets" element={<LeaderboardsAttentionMarkets />} />

          <Route path="/category/hiring-jobs-and-careers" element={<HiringJobsCareers />} />

          <Route path="/category/education-and-learning" element={<EducationLearning />} />

          <Route path="/category/agencies-studios-and-services" element={<AgenciesStudiosServices />} />

          <Route path="/category/ecommerce-and-retail" element={<EcommerceRetail />} />

          <Route path="/category/domains-and-web-assets" element={<DomainsWebAssets />} />

          <Route path="/category/games-and-entertainment" element={<GamesEntertainment />} />

          <Route path="/category/people-and-profiles" element={<PeopleProfiles />} />

          <Route path="/category/productivity-and-personal-tools" element={<ProductivityPersonalTools />} />

          <Route path="/category/design-and-creative" element={<DesignCreative />} />

          <Route path="/category/writing-and-content" element={<WritingContent />} />

          <Route path="/category/directories-launch-and-discovery" element={<DirectoriesLaunchDiscovery />} />

          <Route path="/category/ai-media-generation" element={<AiMediaGeneration />} />

          <Route path="/category/audio-voice-and-podcasting" element={<AudioVoicePodcasting />} />

          <Route path="/category/sales-and-lead-generation" element={<SalesLeadGeneration />} />

          <Route path="/category/travel-local-and-lifestyle" element={<TravelLocalLifestyle />} />

          <Route path="/category/real-estate-and-property" element={<RealEstateProperty />} />

          <Route path="/category/media-and-news" element={<MediaNews />} />

          <Route path="/category/other" element={<Other />} />

          {/* Daily Page */}
          <Route path="/daily" element={<Daily />} />

          {/* Categories overview — navbar link */}
          <Route path="/categories" element={<Categories />} />

          {/* Explore — category bar's pinned Explore button */}
          <Route path="/explore" element={<Explore />} />

          {/* About Page */}
          <Route path="/about" element={<About />} />

          {/* Rules Page */}
          <Route path="/rules" element={<Rules />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Stats page */}
          <Route path="/stats" element={<Stats />} />
           
           {/* for seedetails */}
          <Route path="/product/:id" element={<ClaimDetails />}/>

        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;

import { Link } from "react-router-dom";
import LegalPageLayout from "../components/LegalPageLayout";

const supportEmail = "cosmicwaveglaxy@gmail.com";

const sections = [
  {
    id: "information",
    title: "Information we use",
    content: <><p>When you claim a rank, RankBid collects the listing target, selected category, bid, name, email, country, and any optional phone number, postal code, or business indicator you provide. We also store payment order identifiers and status so we can confirm and support the purchase.</p><p>To run the board, we use listing titles, descriptions, favicons, click counts, and visit information. A browser identifier may be stored locally to count visits and clicks. The pending payment order is kept in your browser session so a refresh can recover its status.</p></>,
  },
  {
    id: "purposes",
    title: "Why we use it",
    content: <><p>We use this information to create and display listings, calculate ranks, process and verify payments, prevent duplicate or fraudulent claims, respond to support requests, and keep the service working. Public listing pages may show the destination, category, ranking bid, and related site metadata; your checkout contact details are not part of the public leaderboard.</p></>,
  },
  {
    id: "payment-providers",
    title: "Payments and service providers",
    content: <><p>Razorpay handles the payment step and receives information needed to process it. RankBid receives the resulting order and payment status, but does not collect full card numbers or UPI PINs on this site. Hosting, database, and security providers may process data needed to operate the service. The listing UI may request a site's favicon from an external image provider.</p><p>Those providers operate under their own terms and privacy notices. The final list of production providers will be reviewed before live launch.</p></>,
  },
  {
    id: "storage",
    title: "Storage and retention",
    content: <><p>We keep account, listing, payment, and support records for as long as needed to operate the service and meet applicable recordkeeping obligations. Browser session data for a pending order normally ends when the session closes or the order is resolved. You can clear local browser storage, though that can reset visit counting and payment recovery on that device.</p></>,
  },
  {
    id: "choices",
    title: "Your choices and contact",
    content: <><p>You can ask about information relating to your listing, request a correction, or raise a privacy concern by emailing <a href={`mailto:${supportEmail}`} className="break-all text-[#c35e3e] underline underline-offset-2">{supportEmail}</a>. We will consider requests under applicable law and may need to keep some payment records for legal or accounting purposes.</p><p>This service is operated by Qais Alam in India. A full business address and final privacy contact details will be added before live payments begin. See the <Link to="/terms" className="text-[#c35e3e] underline underline-offset-2">Terms of Service</Link> for listing and payment conditions.</p></>,
  },
];

function Privacy() {
  return <LegalPageLayout eyebrow="RankBid · Legal" title="Privacy Policy" introduction="This page explains the information used to run RankBid listings, rankings, and payments." sections={sections} related={{ to: "/terms", label: "Terms of Service" }} />;
}

export default Privacy;

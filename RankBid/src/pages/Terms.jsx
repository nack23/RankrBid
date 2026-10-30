import { Link } from "react-router-dom";
import LegalPageLayout from "../components/LegalPageLayout";

const supportEmail = "cosmicwaveglaxy@gmail.com";

const sections = [
  {
    id: "service",
    title: "The service",
    content: <><p>RankBid.lol is a paid public leaderboard operated by Qais Alam in India. You can submit a website, product, or eligible profile and bid for a position on its boards. A listing is a paid placement, not an independent review, endorsement, certification, or promise of results.</p><p>These Terms cover use of the site, listing submissions, and paid rank claims. The <Link to="/rules" className="text-[#c35e3e] underline underline-offset-2">Rules</Link> explain how ranking and categories work; the <Link to="/privacy" className="text-[#c35e3e] underline underline-offset-2">Privacy Policy</Link> explains how information is handled.</p></>,
  },
  {
    id: "eligibility",
    title: "Who can submit a listing",
    content: <><p>You must be at least 18 years old, able to agree to these Terms, and authorized to list the destination you submit. If you act for a business, you confirm that you can act for it. The target, category, contact details, and any other information you provide must be accurate.</p><p>Do not submit another person's brand or profile without permission, or direct visitors to illegal, deceptive, harmful, infringing, or unsafe content. We may review, recategorize, pause, or remove listings that do not follow these Terms or the Rules.</p></>,
  },
  {
    id: "ranking",
    title: "How ranking works",
    content: <><p>Your bid determines the position it can reach when the paid claim is confirmed. The rank shown before payment is an estimate. Other people can bid more, so a position can change at any time. Today's board counts qualifying spend since midnight UTC and resets each day; the all-time board uses its own cumulative ranking.</p><p>Payment does not guarantee a fixed rank, a particular duration at that rank, clicks, visitors, sales, revenue, or search-engine performance. The current board and its <Link to="/rules" className="text-[#c35e3e] underline underline-offset-2">published Rules</Link> show how positions are determined.</p></>,
  },
  {
    id: "payment",
    title: "Price and payment",
    content: <><p>Bids are displayed in US dollars for ranking purposes. At checkout, the service calculates the amount due in Indian rupees and shows it before payment. The final INR charge is the amount you approve in checkout. Your card issuer may apply its own exchange rate or fees if you pay with an international card.</p><p>Razorpay processes payments. RankBid does not ask you to enter your card number or UPI PIN into this site. A claim goes live only after the payment is securely confirmed as captured. Available payment methods depend on the merchant account and your device.</p></>,
  },
  {
    id: "refunds",
    title: "Cancellations and refunds",
    content: <><p>A pending or failed payment does not create a paid listing. Once a captured payment has made the listing live, a later change in rank, a daily reset, or fewer visits than expected does not by itself qualify for an automatic refund. If you were charged but the listing did not appear, or you believe there was a duplicate charge or another payment error, email <a href={`mailto:${supportEmail}`} className="break-all text-[#c35e3e] underline underline-offset-2">{supportEmail}</a> with the order or payment ID so we can investigate.</p><p>We will handle refunds and other remedies required by applicable law. We will not use these Terms to remove rights that cannot legally be waived.</p></>,
  },
  {
    id: "content",
    title: "Listing content and external links",
    content: <><p>You allow RankBid to display the target, submitted details, and publicly available site metadata needed to identify and present the listing. You remain responsible for your destination and for having the rights to submit it. A link from the board takes visitors to a separate site with its own terms and privacy practices.</p><p>If a listing infringes your rights, impersonates you, or points to an unsafe destination, send the listing URL and an explanation to <a href={`mailto:${supportEmail}`} className="break-all text-[#c35e3e] underline underline-offset-2">{supportEmail}</a>.</p></>,
  },
  {
    id: "changes",
    title: "Changes and contact",
    content: <><p>Features, categories, and ranking rules may change. If we make a material change to these Terms, we will update this page before applying the new wording to future purchases. Completed purchases remain subject to the checkout details accepted at their time, except where a change is required by law.</p><p>Operator: Qais Alam, India. Questions about the service, a listing, or payment can be sent to <a href={`mailto:${supportEmail}`} className="break-all text-[#c35e3e] underline underline-offset-2">{supportEmail}</a>. A full business address and final legal terms will be added before live payments begin.</p></>,
  },
];

function Terms() {
  return <LegalPageLayout eyebrow="RankBid · Legal" title="Terms of Service" introduction="Please read these terms before claiming a rank. They explain what a paid placement provides, how the boards change, and how payment issues are handled." sections={sections} related={{ to: "/privacy", label: "Privacy Policy" }} />;
}

export default Terms;

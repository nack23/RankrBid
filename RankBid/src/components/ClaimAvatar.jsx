import { useState } from "react";
import { claimDomain } from "../utils/claimPresentation";

const dimensions = {
  compact: "h-8 w-8",
  sidebar: "h-9 w-9",
  row: "h-12 w-12 sm:h-14 sm:w-14",
  default: "h-14 w-14 sm:h-16 sm:w-16",
  featured: "h-16 w-16 sm:h-[72px] sm:w-[72px]",
  hero: "h-20 w-20 sm:h-24 sm:w-24",
};

function safeHttpUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function ClaimAvatar({ target, iconUrl, small = false, size = "default" }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const domain = claimDomain(target);
  const sources = domain === "Website" ? [] : [
    safeHttpUrl(iconUrl),
    `https://${domain}/apple-touch-icon.png`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
  ].filter(Boolean);
  const dimension = dimensions[small ? "compact" : size] || dimensions.default;

  return (
    <span className={`flex shrink-0 items-center justify-center ${dimension}`} aria-hidden="true">
      {sources[sourceIndex]
        ? <img
            src={sources[sourceIndex]}
            alt=""
            loading="lazy"
            className="h-full w-full rounded-[20%] object-contain"
            onError={() => setSourceIndex((index) => index + 1)}
          />
        : <span className="flex h-full w-full items-center justify-center rounded-[20%] bg-[#fff0e9] text-lg font-bold uppercase text-[#e46f50] dark:bg-[#3a2821]">
            {domain.charAt(0)}
          </span>}
    </span>
  );
}

export default ClaimAvatar;

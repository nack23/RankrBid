export function claimTimestamp(claim) {
  return claim.paid_at || claim.created_at;
}

export function utcDayKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export function claimDomain(target) {
  if (!target?.trim()) return "Website";
  try {
    const input = target.trim();
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return url.hostname.replace(/^www\./i, "") || "Website";
  } catch {
    return target.trim();
  }
}

export function claimTitle(claim) {
  return claim.site_title?.trim() || claimDomain(claim.target);
}

export function formatBid(amount) {
  return `$${Number(amount || 0).toLocaleString("en-US")}`;
}

export function timeAgo(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const units = [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  const [unit, label] = units.find(([duration]) => seconds >= duration);
  const count = Math.floor(seconds / unit);
  return `${count} ${label}${count === 1 ? "" : "s"} ago`;
}

export function sortByBid(claims) {
  return [...claims].sort((left, right) => {
    const difference = Number(right.amount || 0) - Number(left.amount || 0);
    if (difference) return difference;
    return new Date(claimTimestamp(left)).getTime() - new Date(claimTimestamp(right)).getTime();
  });
}

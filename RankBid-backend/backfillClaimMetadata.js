const pool = require("./db");
const { fetchWebsiteMetadata } = require("./services/websiteMetadata");

const BATCH_SIZE = 200;
const CONCURRENCY = 3;

async function enrichClaim(claim) {
  const metadata = await fetchWebsiteMetadata(claim.target);
  if (!metadata.siteTitle && !metadata.description && !metadata.faviconUrl) return false;

  const result = await pool.query(
    `UPDATE rank_claims
       SET site_title = COALESCE(site_title, $2),
           description = COALESCE(description, $3),
           favicon_url = COALESCE(favicon_url, $4)
     WHERE id = $1 AND status = 'paid'`,
    [claim.id, metadata.siteTitle, metadata.description, metadata.faviconUrl]
  );
  return result.rowCount > 0;
}

async function main() {
  let lastId = 0;
  let checked = 0;
  let updated = 0;
  while (true) {
    const { rows } = await pool.query(
      `SELECT id, target FROM rank_claims
        WHERE status = 'paid'
          AND (site_title IS NULL OR description IS NULL OR favicon_url IS NULL)
          AND id > $1
        ORDER BY id
        LIMIT $2`,
      [lastId, BATCH_SIZE]
    );
    if (rows.length === 0) break;
    lastId = rows[rows.length - 1].id;
    checked += rows.length;

    for (let offset = 0; offset < rows.length; offset += CONCURRENCY) {
      const batch = rows.slice(offset, offset + CONCURRENCY);
      const results = await Promise.allSettled(batch.map(enrichClaim));
      updated += results.filter((result) => result.status === "fulfilled" && result.value).length;
      for (const result of results) {
        if (result.status === "rejected") console.error("Could not enrich listing:", result.reason.message);
      }
    }
  }
  console.log(`Checked ${checked} paid listings; updated ${updated}.`);
}

main()
  .catch((error) => {
    console.error("Metadata backfill failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

const cheerio = require("cheerio");

async function fetchWebsiteMetadata(target) {
  try {
    if (!target) {
      return {
        siteTitle: null,
        description: null,
        faviconUrl: null,
      };
    }

    let url = target.trim();

    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {
      url = `https://${url}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RankBid/1.0)",
        Accept:
          "text/html,application/xhtml+xml",
      },

      redirect: "follow",

      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return {
        siteTitle: null,
        description: null,
        faviconUrl: null,
      };
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    // ========================================
    // WEBSITE TITLE
    // ========================================

    const siteTitle =
      $('meta[property="og:title"]')
        .attr("content")
        ?.trim() ||

      $('meta[name="twitter:title"]')
        .attr("content")
        ?.trim() ||

      $("title")
        .first()
        .text()
        .trim() ||

      null;

    // ========================================
    // WEBSITE DESCRIPTION
    // ========================================

    const description =
      $('meta[property="og:description"]')
        .attr("content")
        ?.trim() ||

      $('meta[name="description"]')
        .attr("content")
        ?.trim() ||

      $('meta[name="twitter:description"]')
        .attr("content")
        ?.trim() ||

      null;

    const iconHref =
      $('link[rel="apple-touch-icon"]').first().attr("href") ||
      $('link[rel="apple-touch-icon-precomposed"]').first().attr("href") ||
      $('link[rel="icon"]').first().attr("href") ||
      $('link[rel="shortcut icon"]').first().attr("href");
    let faviconUrl = null;
    if (iconHref) {
      try {
        const icon = new URL(iconHref, response.url);
        if (["http:", "https:"].includes(icon.protocol)) {
          faviconUrl = icon.href.slice(0, 1000);
        }
      } catch {
        // The marketplace can still display a domain favicon fallback.
      }
    }

    return {
      siteTitle: siteTitle
        ? siteTitle.slice(0, 200)
        : null,

      description: description
        ? description.slice(0, 300)
        : null,
      faviconUrl,
    };
  } catch (error) {
    console.error(
      "Website metadata error:",
      error.message
    );

    return {
      siteTitle: null,
      description: null,
      faviconUrl: null,
    };
  }
}

module.exports = {
  fetchWebsiteMetadata,
};

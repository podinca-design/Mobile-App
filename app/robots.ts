import type { MetadataRoute } from "next";

const SITE_URL = "https://touchpointgroup.co";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/business-continuity",
          "/conscious-spending-tool",
          "/csp-tool",
          "/income-protection",
          "/learning-hub-blog",
          "/learning-hub-vlog",
          "/mini-goppi",
          "/retirement-exposure",
          "/risk-exposure",
          "/trust-readiness",
          "/workshop-survey"
        ],
        disallow: ["/api/", "/touchpoint-diagnostic"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}

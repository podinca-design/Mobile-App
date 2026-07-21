import type { MetadataRoute } from "next";

const SITE_URL = "https://touchpointgroup.co";

const PUBLIC_ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/trust-readiness", priority: 0.95 },
  { path: "/business-continuity", priority: 0.9 },
  { path: "/conscious-spending-tool", priority: 0.9 },
  { path: "/csp-tool", priority: 0.85 },
  { path: "/income-protection", priority: 0.85 },
  { path: "/mini-goppi", priority: 0.85 },
  { path: "/retirement-exposure", priority: 0.85 },
  { path: "/risk-exposure", priority: 0.85 },
  { path: "/learning-hub-blog", priority: 0.8 },
  { path: "/learning-hub-vlog", priority: 0.75 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms-disclosures", priority: 0.3 },
  { path: "/workshop-survey", priority: 0.2 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, priority }) => {
    const changeFrequency = path === "/" ? ("weekly" as const) : ("monthly" as const);

    return {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority
    };
  });
}

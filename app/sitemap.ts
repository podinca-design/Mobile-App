import type { MetadataRoute } from "next";
import { BLOG_SEO, SITE_URL, VIDEO_SEO } from "@/lib/seo";

const PUBLIC_ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/trust-readiness", priority: 0.95 },
  { path: "/business-continuity", priority: 0.9 },
  { path: "/csp-tool", priority: 0.9 },
  { path: "/income-protection", priority: 0.9 },
  { path: "/mini-goppi", priority: 0.85 },
  { path: "/retirement-exposure", priority: 0.85 },
  { path: "/learning-hub-blog", priority: 0.8 },
  { path: "/learning-hub-vlog", priority: 0.75 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms-disclosures", priority: 0.3 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const primaryRoutes = PUBLIC_ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority
  }));

  const blogRoutes = Object.keys(BLOG_SEO).map((slug) => ({
    url: `${SITE_URL}/learning-hub-blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  const videoRoutes = Object.keys(VIDEO_SEO).map((slug) => ({
    url: `${SITE_URL}/learning-hub-vlog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.65
  }));

  return [...primaryRoutes, ...blogRoutes, ...videoRoutes];
}

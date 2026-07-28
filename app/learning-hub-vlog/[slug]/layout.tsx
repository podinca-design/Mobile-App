import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL, VIDEO_SEO, createPageMetadata } from "@/lib/seo";

type RouteProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Omit<RouteProps, "children">): Promise<Metadata> {
  const { slug } = await params;
  const item = VIDEO_SEO[slug];
  if (!item) {
    return createPageMetadata({
      title: "Video Not Found",
      description: "The requested TouchPoint Learning Hub video is unavailable.",
      path: `/learning-hub-vlog/${slug}`,
      index: false
    });
  }

  return createPageMetadata({
    title: item.title,
    description: item.description,
    path: `/learning-hub-vlog/${slug}`,
    image: item.image
  });
}

export default async function VideoPageLayout({ children, params }: RouteProps) {
  const { slug } = await params;
  const item = VIDEO_SEO[slug];
  if (!item) return children;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: item.title,
    description: item.description,
    url: `${SITE_URL}/learning-hub-vlog/${slug}`,
    primaryImageOfPage: `${SITE_URL}${item.image}`,
    isPartOf: {
      "@id": `${SITE_URL}/#website`
    },
    inLanguage: "en-US"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BLOG_SEO, SITE_URL, createPageMetadata } from "@/lib/seo";

type RouteProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Omit<RouteProps, "children">): Promise<Metadata> {
  const { slug } = await params;
  const item = BLOG_SEO[slug];
  if (!item) {
    return createPageMetadata({
      title: "Article Not Found",
      description: "The requested TouchPoint Learning Hub article is unavailable.",
      path: `/learning-hub-blog/${slug}`,
      index: false
    });
  }

  return {
    ...createPageMetadata({
      title: item.title,
      description: item.description,
      path: `/learning-hub-blog/${slug}`,
      image: item.image
    }),
    openGraph: {
      title: item.title,
      description: item.description,
      url: `${SITE_URL}/learning-hub-blog/${slug}`,
      siteName: "TouchPoint",
      type: "article",
      locale: "en_US",
      images: [item.image]
    }
  };
}

export default async function BlogArticleLayout({ children, params }: RouteProps) {
  const { slug } = await params;
  const item = BLOG_SEO[slug];
  if (!item) return children;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description,
    image: `${SITE_URL}${item.image}`,
    mainEntityOfPage: `${SITE_URL}/learning-hub-blog/${slug}`,
    author: {
      "@type": "Person",
      name: item.author || "TouchPoint"
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`
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

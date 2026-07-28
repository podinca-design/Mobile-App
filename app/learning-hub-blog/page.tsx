import type { Metadata } from "next";
import { LearningHubPage } from "@/components/touchpoint/learning-hub-page";

export const metadata: Metadata = {
  title: "Learning Hub Blogs",
  description: "TouchPoint Learning Hub articles on child future planning, 529 plans, Trump Accounts, life protection, conscious spending, financial risk, family protection, and retirement taxes.",
  keywords: [
    "TouchPoint blog",
    "child financial planning",
    "529 plan comparison",
    "Trump Account",
    "indexed universal life for children",
    "tax advantaged child savings",
    "life insurance education",
    "financial risk planning",
    "conscious spending articles",
    "retirement tax planning",
    "family protection planning",
    "GOPPI",
    "TOPPI"
  ],
  alternates: {
    canonical: "/learning-hub-blog"
  },
  openGraph: {
    title: "TouchPoint Learning Hub Blogs",
    description: "Educational articles on child future planning, conscious spending, life protection, retirement exposure, and financial decision-making.",
    url: "https://touchpointgroup.co/learning-hub-blog",
    siteName: "TouchPoint",
    type: "website",
    images: ["/learning-hub/black-couple-finance-review.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "TouchPoint Learning Hub Blogs",
    description: "Educational articles on child future planning, conscious spending, protection, and retirement planning decisions.",
    images: ["/learning-hub/black-couple-finance-review.jpg"]
  }
};

export default function BlogLearningHub() {
  return <LearningHubPage kind="blog" />;
}

import type { Metadata } from "next";
import { LearningHubPage } from "@/components/touchpoint/learning-hub-page";

export const metadata: Metadata = {
  title: "Learning Hub Videos",
  description: "TouchPoint Learning Hub videos on personal finance, child future planning, education savings, budgeting, indexed universal life insurance, GOPPI, TOPPI, and family protection planning.",
  keywords: [
    "TouchPoint videos",
    "financial education videos",
    "child future planning videos",
    "529 plan education",
    "living benefits education",
    "budgeting videos",
    "indexed universal life education",
    "IUL education",
    "GOPPI video",
    "TOPPI strategy",
    "life insurance education videos"
  ],
  alternates: {
    canonical: "/learning-hub-vlog"
  },
  openGraph: {
    title: "TouchPoint Learning Hub Videos",
    description: "Educational videos for personal finance, child future planning, budgeting, IUL, GOPPI, TOPPI, and family protection conversations.",
    url: "https://touchpointgroup.co/learning-hub-vlog",
    siteName: "TouchPoint",
    type: "website",
    images: ["/learning-hub/thumbs/vlog-personal-finance-basics.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "TouchPoint Learning Hub Videos",
    description: "Educational videos for personal finance, child future planning, budgeting, IUL, GOPPI, TOPPI, and protection planning.",
    images: ["/learning-hub/thumbs/vlog-personal-finance-basics.jpg"]
  }
};

export default function VlogLearningHub() {
  return <LearningHubPage kind="vlog" />;
}

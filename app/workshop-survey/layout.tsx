import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Workshop Follow-Up Survey",
  description: "Share your workshop priorities and choose the areas you want to explore with TouchPoint.",
  path: "/workshop-survey",
  index: false
});

export default function WorkshopSurveyLayout({ children }: { children: ReactNode }) {
  return children;
}

import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "TouchPoint Planning Tools",
  description: "Use TouchPoint's free planning tools to identify financial priorities and clearer next steps.",
  path: "/",
  index: false
});

export default function DiagnosticAliasLayout({ children }: { children: ReactNode }) {
  return children;
}

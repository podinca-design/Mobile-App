import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { createPageMetadata } from "@/lib/seo";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Free Conscious Spending and Financial Planning Tools",
  description:
    "Use TouchPoint's free conscious spending, protection, retirement exposure, and trust readiness tools to identify clearer financial next steps.",
  path: "/"
});

export default function HomePage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} />;
}

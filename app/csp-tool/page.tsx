import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { createPageMetadata } from "@/lib/seo";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Conscious Spending Tool and GOPPI Snapshot",
  description: "Build a free GOPPI snapshot to see monthly income, recurring expenses, priorities, and available financial breathing room.",
  path: "/csp-tool"
});

export default function CspToolPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="csp" initialStage="tool" />;
}

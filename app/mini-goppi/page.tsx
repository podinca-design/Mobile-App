import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { createPageMetadata } from "@/lib/seo";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Free Mini-GOPPI Financial Snapshot",
  description: "Create a quick Mini-GOPPI snapshot to identify financial pressure, priorities, and a clearer next planning step.",
  path: "/mini-goppi"
});

export default function MiniGoppiPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="learning" initialStage="tool" />;
}

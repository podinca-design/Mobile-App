import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { createPageMetadata } from "@/lib/seo";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Business Continuity Check",
  description: "Identify owner, partner, key-person, and operating dependencies that may expose your business to continuity risk.",
  path: "/business-continuity"
});

export default function BusinessContinuityPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="business" initialStage="selected" />;
}

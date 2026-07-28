import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { createPageMetadata } from "@/lib/seo";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Estate Planning and Trust Readiness Check",
  description: "Review guardianship, beneficiaries, decision-makers, assets, and estate-planning gaps with a free trust readiness check.",
  path: "/trust-readiness"
});

export default function TrustReadinessPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="trust" initialStage="tool" />;
}

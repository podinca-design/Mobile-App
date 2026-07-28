import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { createPageMetadata } from "@/lib/seo";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Retirement Tax and Income Exposure Check",
  description: "Identify retirement income, tax, RMD, longevity, and market-timing exposures that may affect your future cash flow.",
  path: "/retirement-exposure"
});

export default function RetirementExposurePage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="retirement" initialStage="tool" />;
}

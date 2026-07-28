import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { createPageMetadata } from "@/lib/seo";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Income Protection Risk Check",
  description: "Use a free risk check to identify income, debt, family, and life-insurance protection gaps that may deserve attention.",
  path: "/income-protection"
});

export default function IncomeProtectionPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="protection" initialStage="tool" />;
}

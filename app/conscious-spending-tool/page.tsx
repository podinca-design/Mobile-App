import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TouchPoint Conscious Spending Tool",
  description: "Open the TouchPoint Conscious Spending Tool directly and build a GOPPI snapshot."
};

export default function ConsciousSpendingToolPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="csp" initialStage="tool" />;
}

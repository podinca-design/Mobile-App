import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TouchPoint CSP Tool",
  description: "Open the TouchPoint Conscious Spending Tool directly and build a GOPPI snapshot."
};

export default function CspToolPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="csp" initialStage="tool" />;
}

import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Retirement Exposure Check",
  description: "Open the TouchPoint retirement exposure check directly."
};

export default function RetirementExposurePage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="retirement" initialStage="tool" />;
}

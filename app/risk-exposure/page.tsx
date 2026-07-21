import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TouchPoint Risk Exposure Check",
  description: "Open the 60-second TouchPoint risk exposure check directly."
};

export default function RiskExposurePage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="protection" initialStage="tool" />;
}

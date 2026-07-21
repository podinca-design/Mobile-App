import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Business Continuity Check | TouchPoint",
  description: "Open the TouchPoint business continuity check directly."
};

export default function BusinessContinuityPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="business" initialStage="selected" />;
}

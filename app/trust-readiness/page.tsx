import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trust Readiness Check",
  description: "Open the TouchPoint trust readiness check directly."
};

export default function TrustReadinessPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="trust" initialStage="tool" />;
}

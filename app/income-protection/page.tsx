import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Income Protection Risk Check",
  description: "Open the TouchPoint income protection risk check directly."
};

export default function IncomeProtectionPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="protection" initialStage="tool" />;
}

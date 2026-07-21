import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mini-GOPPI Snapshot",
  description: "Open the TouchPoint Mini-GOPPI snapshot directly."
};

export default function MiniGoppiPage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} initialPath="learning" initialStage="tool" />;
}

import { TouchPointDiagnosticApp } from "@/components/touchpoint/touchpoint-diagnostic-app";
import { touchPointBrand } from "@/lib/touchpoint-brand";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <TouchPointDiagnosticApp brand={touchPointBrand} />;
}

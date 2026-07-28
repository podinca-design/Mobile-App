import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Trust Design Intake | TouchPoint Group",
  description: "Complete the TouchPoint Group trust design intake before your planning meeting.",
  path: "/trust-intake",
  index: false
});

export default function TrustIntakePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b2030" }}>
      <iframe
        title="TouchPoint Group Trust Design Intake"
        src="/trust-intake-form.html"
        style={{ border: 0, display: "block", minHeight: "100vh", width: "100%" }}
      />
    </main>
  );
}

import { GovernancePage } from "@/components/touchpoint/governance-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms and Disclosures",
  description: "TouchPoint terms, disclosures, educational-use notices, and insurance planning disclaimers.",
  path: "/terms-disclosures"
});

export default function TermsDisclosuresPage() {
  return <GovernancePage kind="terms" />;
}

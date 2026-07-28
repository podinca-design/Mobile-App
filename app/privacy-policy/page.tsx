import { GovernancePage } from "@/components/touchpoint/governance-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "TouchPoint privacy policy for website, planning tools, forms, scheduling links, and related services.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return <GovernancePage kind="privacy" />;
}

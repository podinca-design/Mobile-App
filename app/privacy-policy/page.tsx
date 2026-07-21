import { GovernancePage } from "@/components/touchpoint/governance-page";

export const metadata = {
  title: "Privacy Policy",
  description: "TouchPoint privacy policy for website, planning tools, forms, scheduling links, and related services."
};

export default function PrivacyPolicyPage() {
  return <GovernancePage kind="privacy" />;
}

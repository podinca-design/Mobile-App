import { GovernancePage } from "@/components/touchpoint/governance-page";

export const metadata = {
  title: "Terms and Disclosures",
  description: "TouchPoint terms, disclosures, educational-use notices, and insurance planning disclaimers."
};

export default function TermsDisclosuresPage() {
  return <GovernancePage kind="terms" />;
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://touchpointgroup.co"),
  title: {
    default: "TouchPoint | Free Conscious Spending and Planning Tools",
    template: "%s | TouchPoint"
  },
  description: "Use TouchPoint's free Conscious Spending Tool, GOPPI snapshot, protection checks, retirement exposure tools, and trust readiness path to find clearer next steps.",
  keywords: [
    "TouchPoint",
    "TouchPoint Conscious Spending Tool",
    "conscious spending tool",
    "free budgeting tool",
    "financial planning tool",
    "GOPPI snapshot",
    "TOPPI strategy",
    "retirement exposure",
    "life insurance coverage",
    "trust readiness"
  ],
  applicationName: "TouchPoint",
  authors: [{ name: "TouchPoint" }],
  creator: "TouchPoint",
  publisher: "TouchPoint",
  category: "financial planning",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "TouchPoint Conscious Spending Tool",
    description: "Free planning tools to identify financial concerns, build a GOPPI snapshot, and choose a clearer next step.",
    url: "https://touchpointgroup.co",
    siteName: "TouchPoint",
    type: "website",
    locale: "en_US",
    images: ["/brand/touchpoint-hero-pressure.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "TouchPoint Conscious Spending Tool",
    description: "Free planning tools for conscious spending, GOPPI snapshots, protection, retirement timing, and trust readiness.",
    images: ["/brand/touchpoint-hero-pressure.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/brand/touchpoint-logo-final-384.png",
    apple: "/brand/touchpoint-logo-final-384.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07111F",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

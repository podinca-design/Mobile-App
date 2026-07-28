import type { Metadata } from "next";

export const SITE_URL = "https://touchpointgroup.co";
export const SITE_NAME = "TouchPoint";
export const DEFAULT_SOCIAL_IMAGE = "/brand/touchpoint-hero-pressure.jpg";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_SOCIAL_IMAGE,
  index = true
}: PageMetadataOptions): Metadata {
  const canonicalPath = path === "/" ? "/" : path.replace(/\/+$/, "");
  const url = `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "TouchPoint Group",
      alternateName: "TouchPoint",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/touchpoint-logo-final-384.png`
      }
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "TouchPoint",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US"
    }
  ]
};

export type LearningContentSeo = {
  title: string;
  description: string;
  image: string;
  author?: string;
};

export const BLOG_SEO: Record<string, LearningContentSeo> = {
  "conscious-spending-vs-budgeting": {
    title: "Conscious Spending vs. Budgeting: A Better Starting Point",
    description: "See how conscious spending clarifies committed costs, flexible choices, and the next financial step beyond traditional budgeting.",
    image: "/learning-hub/thumbs/blog-conscious-spending-vs-budgeting.jpg",
    author: "N. Caruthers"
  },
  "child-financial-foundation": {
    title: "Why Wait to Build Your Child's Financial Foundation?",
    description: "Compare 529 plans, child savings options, and life protection strategies for a more flexible family financial foundation.",
    image: "/learning-hub/black-couple-finance-review.jpg",
    author: "N. Caruthers"
  },
  "long-term-care-planning": {
    title: "Who Takes Care of the Plan If You Need Care?",
    description: "Understand long-term care costs, family impact, and planning choices that can protect independence and financial flexibility.",
    image: "/learning-hub/thumbs/financial-risk-review.webp",
    author: "N. Caruthers"
  },
  "business-continuity-owner-risk": {
    title: "If Your Business Depends on You, What Happens When You Cannot Be There?",
    description: "Identify owner, partner, and key-person dependencies that can expose a business to costly continuity risk.",
    image: "/learning-hub/thumbs/blog-business-continuity-owner.jpg",
    author: "N. Caruthers"
  },
  "what-is-life-insurance": {
    title: "What Is Life Insurance and How Does It Work?",
    description: "Learn how term and permanent life insurance can protect income, family stability, expenses, and long-term goals.",
    image: "/learning-hub/thumbs/blog-what-is-life-insurance.jpg",
    author: "N. Caruthers"
  },
  "understanding-financial-risk": {
    title: "Understanding Financial Risk",
    description: "Learn how income, debt, market, and longevity risks can affect household stability and long-term financial goals.",
    image: "/learning-hub/thumbs/blog-understanding-financial-risk.jpg",
    author: "N. Caruthers"
  },
  "building-trust-financial-plan": {
    title: "Building Trust in Your Financial Plan",
    description: "See how clarity, alignment, and regular reviews can make a financial plan easier to understand and follow.",
    image: "/learning-hub/thumbs/blog-building-trust-financial-plan.jpg",
    author: "N. Caruthers"
  },
  "financial-foundations": {
    title: "How Much Life Insurance Do You Really Need?",
    description: "Estimate life insurance needs using household income, debts, existing resources, and the future goals your family depends on.",
    image: "/learning-hub/thumbs/blog-how-much-life-insurance.jpg",
    author: "N. Caruthers"
  },
  "informed-financial-decisions": {
    title: "Making Informed Financial Decisions",
    description: "Use a clear financial baseline to compare benefits, risks, and trade-offs before choosing your next planning step.",
    image: "/learning-hub/thumbs/blog-informed-financial-decisions.jpg",
    author: "N. Caruthers"
  },
  "before-buying-life-insurance": {
    title: "What to Know Before Buying Life Insurance",
    description: "Review purpose, policy type, budget, features, and family needs before choosing life insurance coverage.",
    image: "/learning-hub/thumbs/blog-before-buying-life-insurance.jpg",
    author: "N. Caruthers"
  },
  "financial-growth-collaboration": {
    title: "Financial Growth Through Collaboration",
    description: "Learn how shared support, trusted guidance, and clearer conversations can strengthen financial decision-making.",
    image: "/learning-hub/thumbs/blog-financial-growth-collaboration.jpg",
    author: "N. Caruthers"
  },
  "retirement-risk-taxes-rmds": {
    title: "Retirement Risk, Taxes, and RMDs",
    description: "Understand how market risk, taxes, required minimum distributions, and fees can affect retirement income.",
    image: "/learning-hub/thumbs/blog-retirement-risk-taxes.jpg",
    author: "N. Caruthers"
  }
};

export const VIDEO_SEO: Record<string, LearningContentSeo> = {
  "personal-finance-basics-khan": {
    title: "Personal Finance Basics",
    description: "Watch a plain-language introduction to personal finance, budgeting, saving, and spending decisions.",
    image: "/learning-hub/thumbs/vlog-personal-finance-basics.jpg"
  },
  "budgeting-saving-khan": {
    title: "Budgeting and Saving",
    description: "Watch an educational overview of budgeting, saving, and everyday spending decisions.",
    image: "/learning-hub/thumbs/vlog-budgeting-saving.jpg"
  },
  "understanding-iul-carrier": {
    title: "Understanding Indexed Universal Life",
    description: "Watch an educational overview of indexed universal life insurance and its core mechanics.",
    image: "/learning-hub/thumbs/vlog-understanding-iul.jpg"
  },
  "how-iul-works-carrier": {
    title: "How Indexed Universal Life Works",
    description: "Review a compliance-friendly explanation of indexed universal life insurance mechanics.",
    image: "/learning-hub/thumbs/vlog-how-iul-works.jpg"
  },
  "mutual-of-omaha-introduction-to-iul": {
    title: "An Introduction to Indexed Universal Life Insurance",
    description: "Review Mutual of Omaha education on indexed universal life, family protection, and supplemental retirement planning.",
    image: "/learning-hub/thumbs/vlog-child-future-planning.jpg"
  },
  "mutual-of-omaha-how-iul-credits-interest": {
    title: "How IUL Credits Interest",
    description: "Learn how indexed universal life may credit interest and how index-linked crediting differs from direct market investing.",
    image: "/learning-hub/thumbs/vlog-iul-credits-interest.jpg"
  },
  "mutual-of-omaha-iul-retirement-example": {
    title: "An Example of How IUL Can Work for Retirement",
    description: "Review a carrier example of how indexed universal life may support a broader retirement planning conversation.",
    image: "/learning-hub/thumbs/vlog-iul-retirement-example.jpg"
  },
  "mutual-of-omaha-child-future": {
    title: "Investing in Your Child's Future",
    description: "Explore education costs and how life insurance may fit into a broader child future planning conversation.",
    image: "/learning-hub/thumbs/vlog-mutual-iul-intro.jpg"
  },
  "529-education-savings-explained": {
    title: "529 Plans and Education Savings",
    description: "Watch a plain-language explanation of how 529 plans can help families prepare for qualified education expenses.",
    image: "/learning-hub/thumbs/vlog-529-education-savings.jpg"
  },
  "national-life-living-benefits": {
    title: "Living Benefits and Family Protection",
    description: "Review educational resources about how living benefits may support families during qualifying serious life events.",
    image: "/learning-hub/thumbs/vlog-living-benefits-family-protection.jpg"
  }
};

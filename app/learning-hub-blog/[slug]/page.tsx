"use client";

import { useParams } from "next/navigation";
import { LearningHubDetailPage } from "@/components/touchpoint/learning-hub-page";

export default function BlogDetailRoute() {
  const params = useParams<{ slug: string }>();

  return <LearningHubDetailPage kind="blog" slug={params.slug} />;
}

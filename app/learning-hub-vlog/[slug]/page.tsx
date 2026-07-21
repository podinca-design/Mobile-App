"use client";

import { useParams } from "next/navigation";
import { LearningHubDetailPage } from "@/components/touchpoint/learning-hub-page";

export default function VlogDetailRoute() {
  const params = useParams<{ slug: string }>();

  return <LearningHubDetailPage kind="vlog" slug={params.slug} />;
}

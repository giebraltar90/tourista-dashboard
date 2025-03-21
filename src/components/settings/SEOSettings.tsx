
import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEOForm } from "./seo/SEOForm";
import { useQuery } from "@tanstack/react-query";

export function SEOSettings() {
  const { isLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: () => Promise.resolve(true), // Just to track loading state
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO & Sharing Settings</CardTitle>
        <CardDescription>
          Customize how your site appears when shared on social media and set your favicon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SEOForm />
      </CardContent>
    </Card>
  );
}

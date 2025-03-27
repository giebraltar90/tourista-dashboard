
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const LoadingState = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tours" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tours
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

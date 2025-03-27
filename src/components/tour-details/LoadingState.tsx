
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      
      <div className="grid gap-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-[200px] w-full rounded-md" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-[150px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[120px] w-full rounded-md" />
            <Skeleton className="h-[120px] w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

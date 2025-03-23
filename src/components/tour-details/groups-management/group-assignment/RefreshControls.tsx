
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshControlsProps {
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const RefreshControls = ({ 
  isLoading, 
  isRefreshing, 
  onRefresh 
}: RefreshControlsProps) => {
  // If everything is loading, show nothing to avoid UI jumping
  if (isLoading) {
    return null;
  }
  
  return (
    <div className="flex justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="text-xs"
      >
        <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
      </Button>
    </div>
  );
};

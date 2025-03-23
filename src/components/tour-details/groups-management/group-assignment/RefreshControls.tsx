
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";

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
  return (
    <div className="flex justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading || isRefreshing}
        className="text-xs"
      >
        <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Database'}
      </Button>
    </div>
  );
};

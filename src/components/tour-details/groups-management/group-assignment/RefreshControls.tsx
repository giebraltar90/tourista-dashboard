
import { Button } from "@/components/ui/button";
import { RefreshCw, PlusCircle } from "lucide-react";

interface RefreshControlsProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onAddTestParticipants: () => void;
}

export const RefreshControls = ({ 
  isRefreshing, 
  onRefresh, 
  onAddTestParticipants 
}: RefreshControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onAddTestParticipants}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Test Participants
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Participants'}
      </Button>
    </div>
  );
};

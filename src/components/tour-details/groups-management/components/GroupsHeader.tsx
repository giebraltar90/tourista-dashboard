
import { Button } from "@/components/ui/button";
import { RefreshCw, PlusCircle } from "lucide-react";

interface GroupsHeaderProps {
  isManualRefreshing: boolean;
  isFixingDatabase: boolean;
  onManualRefresh: () => void;
}

export const GroupsHeader = ({ 
  isManualRefreshing, 
  isFixingDatabase, 
  onManualRefresh 
}: GroupsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onManualRefresh}
        disabled={isManualRefreshing || isFixingDatabase}
      >
        {isManualRefreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
        {isManualRefreshing ? "Refreshing..." : "Refresh Participants"}
      </Button>
    </div>
  );
};

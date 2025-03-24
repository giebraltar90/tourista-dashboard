
import { Button } from "@/components/ui/button";
import { RefreshCw, FilePlus2 } from "lucide-react";

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
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onManualRefresh}
          disabled={isManualRefreshing || isFixingDatabase}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isManualRefreshing ? 'animate-spin' : ''}`} />
          {isManualRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
        >
          <FilePlus2 className="h-4 w-4 mr-1" /> Add Test Participants
        </Button>
      </div>
    </div>
  );
};

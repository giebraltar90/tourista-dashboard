
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Participant Management</CardTitle>
        <CardDescription>Drag and drop participants between groups</CardDescription>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onManualRefresh} 
          disabled={isManualRefreshing || isFixingDatabase}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isManualRefreshing ? 'animate-spin' : ''}`} />
          Refresh Participants
        </Button>
      </div>
    </CardHeader>
  );
};

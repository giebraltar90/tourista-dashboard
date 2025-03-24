
import { RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GroupCardHeaderProps {
  groupName: string;
  displayParticipants: string;
  totalParticipants: number;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  handleRefreshParticipants: () => void;
  isRefreshing: boolean;
}

export const GroupCardHeader = ({
  groupName,
  displayParticipants,
  totalParticipants,
  isExpanded,
  setIsExpanded,
  handleRefreshParticipants,
  isRefreshing
}: GroupCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-8 w-8"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
        
        <div className="flex flex-col">
          <div className="flex items-center">
            <h3 className="font-semibold text-base">{groupName}</h3>
            <Badge variant="secondary" className="ml-2">
              {displayParticipants}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Participants
          </p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleRefreshParticipants}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
};

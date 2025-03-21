
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <h3 className="text-base font-medium">{groupName}</h3>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            totalParticipants >= 15 
              ? "bg-red-100 text-red-800" 
              : totalParticipants >= 10 
                ? "bg-amber-100 text-amber-800" 
                : "bg-green-100 text-green-800"
          }`}
        >
          {displayParticipants}
        </Badge>
      </div>
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={handleRefreshParticipants}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh participants</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </Button>
      </div>
    </div>
  );
};

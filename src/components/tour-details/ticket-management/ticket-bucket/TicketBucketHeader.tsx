
import { InfoIcon, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TicketBucketHeaderProps {
  onAssignBucket: () => void;
}

export const TicketBucketHeader = ({ onAssignBucket }: TicketBucketHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-medium">Ticket Buckets</h3>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-1 cursor-help">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <p>Ticket buckets show reference numbers and available tickets for this tour</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAssignBucket}
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" />
          Add Bucket
        </Button>
      </div>
    </div>
  );
};

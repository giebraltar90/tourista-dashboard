
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketIcon, PlusCircleIcon } from "lucide-react";
import { AssignBucketDialog } from "../AssignBucketDialog";

interface TicketBucketEmptyProps {
  onAssignBucket: () => void;
  isAssignDialogOpen: boolean;
  onCloseDialog: () => void;
  tourId: string;
  tourDate: Date;
}

export const TicketBucketEmpty = ({ 
  onAssignBucket, 
  isAssignDialogOpen, 
  onCloseDialog, 
  tourId, 
  tourDate 
}: TicketBucketEmptyProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Ticket Buckets</h3>
      <Card className="p-4 bg-secondary/30">
        <div className="flex flex-col items-center justify-center space-y-2 py-6">
          <TicketIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground text-center">No ticket buckets allocated to this tour yet</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={onAssignBucket}
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Assign Ticket Bucket
          </Button>
        </div>
      </Card>
      
      {isAssignDialogOpen && (
        <AssignBucketDialog 
          isOpen={isAssignDialogOpen} 
          onClose={onCloseDialog} 
          tourId={tourId}
          tourDate={tourDate}
        />
      )}
    </div>
  );
};

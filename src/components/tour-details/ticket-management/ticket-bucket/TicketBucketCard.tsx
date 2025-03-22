
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircleIcon, PencilIcon } from "lucide-react";
import { TicketBucket } from "@/types/ticketBuckets";
import { format } from "date-fns";
import { EditTicketBucketDialog } from "./EditTicketBucketDialog";

interface TicketBucketCardProps {
  bucket: TicketBucket;
  onRemove: (bucketId: string) => Promise<boolean>;
}

export const TicketBucketCard = ({ bucket, onRemove }: TicketBucketCardProps) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleRemoveBucket = async () => {
    if (confirm("Are you sure you want to remove this ticket bucket from the tour?")) {
      setIsRemoving(true);
      try {
        await onRemove(bucket.id);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  return (
    <div className="bg-secondary/30 p-3 rounded-md">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="font-medium">{bucket.reference_number}</span>
            <Badge className="ml-2" variant={bucket.bucket_type === 'petit' ? 'outline' : 'secondary'}>
              {bucket.bucket_type}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground flex items-center mt-1">
            <span>{format(bucket.date, 'MMM d, yyyy')}</span>
            {bucket.access_time && (
              <span className="ml-2">• {bucket.access_time}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center justify-end">
              <span className="font-medium">{bucket.max_tickets - bucket.allocated_tickets}</span>
              <span className="text-muted-foreground ml-1">/ {bucket.max_tickets}</span>
            </div>
            <span className="text-xs text-muted-foreground">available tickets</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary h-8 w-8"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive h-8 w-8"
            onClick={handleRemoveBucket}
            disabled={isRemoving}
          >
            <XCircleIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isEditDialogOpen && (
        <EditTicketBucketDialog 
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          bucket={bucket}
        />
      )}
    </div>
  );
};

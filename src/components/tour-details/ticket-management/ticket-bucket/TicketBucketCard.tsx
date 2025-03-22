
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Ticket, Trash2 } from "lucide-react";
import { TicketBucket } from "@/types/ticketBuckets";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { EditTicketBucketDialog } from "./EditTicketBucketDialog";

interface TicketBucketCardProps {
  bucket: TicketBucket;
  onRemove: (bucketId: string) => void;
}

export const TicketBucketCard = ({ bucket, onRemove }: TicketBucketCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Calculate available tickets
  const availableTickets = bucket.available_tickets !== undefined ? 
    bucket.available_tickets : 
    (bucket.max_tickets - bucket.allocated_tickets);
  
  // Log bucket information for debugging
  useEffect(() => {
    console.log("🔍 [TicketBucketCard] Rendering bucket:", {
      id: bucket.id,
      reference: bucket.reference_number,
      maxTickets: bucket.max_tickets,
      allocatedTickets: bucket.allocated_tickets,
      availableTickets,
      date: bucket.date instanceof Date ? bucket.date.toISOString() : bucket.date,
      dateComponents: bucket.date instanceof Date ? {
        year: bucket.date.getFullYear(),
        month: bucket.date.getMonth() + 1,
        day: bucket.date.getDate()
      } : "Not a Date object"
    });
  }, [bucket, availableTickets]);
  
  // Format date for display
  const formattedDate = bucket.date instanceof Date ? 
    format(bucket.date, "MMM d, yyyy") : 
    "Invalid Date";

  return (
    <>
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-4 pb-0">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-sm">{bucket.reference_number}</h4>
              <p className="text-xs text-muted-foreground">
                {bucket.bucket_type === 'petit' ? 'Petit' : 'Grande'} | {formattedDate}
              </p>
            </div>
            <div className="flex items-center text-sm space-x-1">
              <Ticket className="h-4 w-4 text-indigo-500" />
              <span>
                <span className={availableTickets === 0 ? "text-destructive" : "text-primary"}>
                  {availableTickets}
                </span>
                /{bucket.max_tickets}
              </span>
            </div>
          </div>
          
          <div className="text-xs flex items-center mb-2">
            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">
              {bucket.access_time || "No specified time"}
            </span>
          </div>
        </CardContent>
        
        <CardFooter className="p-2 flex justify-between bg-secondary/20">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:text-destructive"
            onClick={() => onRemove(bucket.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </CardFooter>
      </Card>
      
      {isEditDialogOpen && (
        <EditTicketBucketDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          bucket={bucket}
        />
      )}
    </>
  );
};

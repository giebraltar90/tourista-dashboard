
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TicketBucket } from "@/types/ticketBuckets";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { GuideTicketsList } from "../../overview/tickets/GuideTicketsList";

interface TicketBucketListProps {
  buckets: TicketBucket[];
  onRemoveBucket: (bucketId: string) => void;
  tourId: string;
  requiredTickets: number;
}

export const TicketBucketList = ({ 
  buckets, 
  onRemoveBucket, 
  tourId,
  requiredTickets
}: TicketBucketListProps) => {
  // Filter buckets that are assigned to this tour
  const assignedBuckets = buckets.filter(bucket => 
    bucket.assigned_tours?.includes(tourId)
  );
  
  if (assignedBuckets.length === 0) {
    return (
      <div className="text-center p-4 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">No ticket buckets assigned to this tour</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {assignedBuckets.map((bucket) => {
        // Find the allocation for this specific tour
        const tourAllocation = bucket.tour_allocations?.find(
          allocation => allocation.tour_id === tourId
        );
        
        // Calculate tickets allocated to this tour
        const ticketsAllocatedToThisTour = tourAllocation?.tickets_required || 0;
        
        // Calculate if we have enough tickets
        const hasEnoughTickets = ticketsAllocatedToThisTour >= requiredTickets;
        
        // Format the date
        const formattedDate = bucket.date ? format(bucket.date, 'MMM d, yyyy') : 'Unknown date';
        
        return (
          <Card key={bucket.id} className={`overflow-hidden border ${hasEnoughTickets ? 'border-green-200' : 'border-amber-200'}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{bucket.reference_number}</h4>
                  <div className="text-sm text-muted-foreground">
                    {formattedDate} • {bucket.bucket_type} • {bucket.max_tickets} tickets
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Total tickets:</span>
                      <span className="ml-1">{bucket.max_tickets}</span>
                    </div>
                    <div>
                      <span className="font-medium">Allocated to this tour:</span>
                      <span className={`ml-1 ${hasEnoughTickets ? 'text-green-600' : 'text-amber-600'}`}>
                        {ticketsAllocatedToThisTour}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onRemoveBucket(bucket.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

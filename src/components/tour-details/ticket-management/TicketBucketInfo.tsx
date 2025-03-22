
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon, TicketIcon, PlusCircleIcon, XCircleIcon } from "lucide-react";
import { TicketBucket } from "@/types/ticketBuckets";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssignBucketDialog } from "./AssignBucketDialog";
import { removeBucketFromTour } from "@/services/api/tourTicketService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TicketBucketInfoProps {
  buckets: TicketBucket[];
  isLoading: boolean;
  tourId: string;
  requiredTickets: number;
  tourDate: Date;
}

export const TicketBucketInfo = ({ buckets, isLoading, tourId, requiredTickets, tourDate }: TicketBucketInfoProps) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Calculate total tickets available in buckets
  const totalBucketTickets = buckets.reduce((sum, bucket) => {
    return sum + (bucket.max_tickets - bucket.allocated_tickets);
  }, 0);

  // Check if we have enough tickets in buckets
  const hasEnoughBucketTickets = totalBucketTickets >= requiredTickets;

  const handleRemoveBucket = async (bucketId: string) => {
    if (confirm("Are you sure you want to remove this ticket bucket from the tour?")) {
      setIsRemoving(bucketId);
      try {
        await removeBucketFromTour(bucketId);
        queryClient.invalidateQueries({ queryKey: ['ticketBuckets', tourId] });
        toast.success("Ticket bucket removed from tour");
      } catch (error) {
        console.error("Error removing bucket:", error);
        toast.error("Failed to remove ticket bucket");
      } finally {
        setIsRemoving(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Ticket Buckets</h3>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (buckets.length === 0) {
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
              onClick={() => setIsAssignDialogOpen(true)}
            >
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Assign Ticket Bucket
            </Button>
          </div>
        </Card>
        
        {isAssignDialogOpen && (
          <AssignBucketDialog 
            isOpen={isAssignDialogOpen} 
            onClose={() => setIsAssignDialogOpen(false)} 
            tourId={tourId}
            tourDate={tourDate}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            onClick={() => setIsAssignDialogOpen(true)}
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add Bucket
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {buckets.map((bucket) => (
          <div key={bucket.id} className="bg-secondary/30 p-3 rounded-md">
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
                  className="text-destructive h-8 w-8"
                  onClick={() => handleRemoveBucket(bucket.id)}
                  disabled={isRemoving === bucket.id}
                >
                  <XCircleIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2 mt-2 border-t">
          <span className="font-medium">Total Available:</span>
          <Badge 
            variant={hasEnoughBucketTickets ? "secondary" : "destructive"} 
            className={hasEnoughBucketTickets ? "bg-green-100 text-green-800" : ""}
          >
            {totalBucketTickets} tickets
            {requiredTickets > 0 && (
              <span className="ml-1">
                ({requiredTickets} needed)
              </span>
            )}
          </Badge>
        </div>
      </div>
      
      {isAssignDialogOpen && (
        <AssignBucketDialog 
          isOpen={isAssignDialogOpen} 
          onClose={() => setIsAssignDialogOpen(false)} 
          tourId={tourId}
          tourDate={tourDate}
        />
      )}
    </div>
  );
};

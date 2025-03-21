
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon, TicketIcon } from "lucide-react";
import { TicketBucket } from "@/types/ticketBuckets";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TicketBucketInfoProps {
  buckets: TicketBucket[];
  isLoading: boolean;
  tourId: string;
  requiredTickets: number;
}

export const TicketBucketInfo = ({ buckets, isLoading, tourId, requiredTickets }: TicketBucketInfoProps) => {
  // Calculate total tickets available in buckets
  const totalBucketTickets = buckets.reduce((sum, bucket) => {
    return sum + (bucket.max_tickets - bucket.allocated_tickets);
  }, 0);

  // Check if we have enough tickets in buckets
  const hasEnoughBucketTickets = totalBucketTickets >= requiredTickets;

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
            <Button variant="outline" size="sm" className="mt-2">Assign Ticket Bucket</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Ticket Buckets</h3>
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
              <div className="text-right">
                <div className="flex items-center justify-end">
                  <span className="font-medium">{bucket.max_tickets - bucket.allocated_tickets}</span>
                  <span className="text-muted-foreground ml-1">/ {bucket.max_tickets}</span>
                </div>
                <span className="text-xs text-muted-foreground">available tickets</span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2 mt-2 border-t">
          <span className="font-medium">Total Available:</span>
          <Badge variant={hasEnoughBucketTickets ? "success" : "destructive"} className={hasEnoughBucketTickets ? "bg-green-100 text-green-800" : ""}>
            {totalBucketTickets} tickets
            {requiredTickets > 0 && (
              <span className="ml-1">
                ({requiredTickets} needed)
              </span>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
};

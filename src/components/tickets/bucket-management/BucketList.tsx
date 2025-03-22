
import { Button } from "@/components/ui/button";
import { TicketBucket } from "@/types/ticketBuckets";
import { BucketDateGroup } from "./BucketDateGroup";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface BucketListProps {
  bucketsByDate: Record<string, TicketBucket[]>;
  sortedDates: string[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (bucket: TicketBucket) => void;
  onCreateNew: () => void;
}

export function BucketList({ 
  bucketsByDate, 
  sortedDates, 
  loading, 
  onDelete, 
  onEdit,
  onCreateNew
}: BucketListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
        <p className="mt-2 text-muted-foreground">Loading ticket buckets...</p>
      </div>
    );
  }
  
  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No ticket buckets found</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={onCreateNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket Bucket
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {sortedDates.map(dateStr => {
        const bucketsForDate = bucketsByDate[dateStr];
        const date = new Date(dateStr);
        
        return (
          <BucketDateGroup 
            key={dateStr} 
            date={date} 
            buckets={bucketsForDate} 
            onDelete={onDelete} 
            onEdit={onEdit} 
          />
        );
      })}
    </div>
  );
}

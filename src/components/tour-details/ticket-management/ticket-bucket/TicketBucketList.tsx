
import { TicketBucket } from "@/types/ticketBuckets";
import { TicketBucketCard } from "./TicketBucketCard";

interface TicketBucketListProps {
  buckets: TicketBucket[];
  onRemoveBucket: (bucketId: string) => Promise<boolean>;
  tourId: string;
  requiredTickets: number;
}

export const TicketBucketList = ({ buckets, onRemoveBucket, tourId, requiredTickets }: TicketBucketListProps) => {
  return (
    <div className="space-y-3">
      {buckets.map((bucket) => (
        <TicketBucketCard 
          key={bucket.id} 
          bucket={bucket} 
          onRemove={onRemoveBucket}
          tourId={tourId}
          requiredTickets={requiredTickets}
        />
      ))}
    </div>
  );
};

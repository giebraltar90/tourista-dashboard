
import { TicketBucket } from "@/types/ticketBuckets";
import { TicketBucketCard } from "./TicketBucketCard";

interface TicketBucketListProps {
  buckets: TicketBucket[];
  onRemoveBucket: (bucketId: string) => Promise<boolean>;
}

export const TicketBucketList = ({ buckets, onRemoveBucket }: TicketBucketListProps) => {
  return (
    <div className="space-y-3">
      {buckets.map((bucket) => (
        <TicketBucketCard 
          key={bucket.id} 
          bucket={bucket} 
          onRemove={onRemoveBucket}
        />
      ))}
    </div>
  );
};

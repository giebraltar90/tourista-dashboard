
import { format, isAfter } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TicketBucket } from "@/types/ticketBuckets";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BucketItem } from "./BucketItem";

interface BucketDateGroupProps {
  date: Date;
  buckets: TicketBucket[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (bucket: TicketBucket) => void;
}

export function BucketDateGroup({ date, buckets, onDelete, onEdit }: BucketDateGroupProps) {
  const isPast = isAfter(new Date(), date);
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className={cn(
        "px-4 py-2 font-medium text-sm",
        isPast ? "bg-gray-100 text-gray-700" : "bg-blue-50 text-blue-800"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <Badge variant={isPast ? "outline" : "secondary"}>
            {isPast ? "Past Date" : "Upcoming"}
          </Badge>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference Number</TableHead>
            <TableHead>Bucket Type</TableHead>
            <TableHead>Access Time</TableHead>
            <TableHead>Tickets</TableHead>
            <TableHead>Allocated</TableHead>
            <TableHead>Available</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map(bucket => (
            <BucketItem 
              key={bucket.id} 
              bucket={bucket} 
              onDelete={onDelete} 
              onEdit={onEdit} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

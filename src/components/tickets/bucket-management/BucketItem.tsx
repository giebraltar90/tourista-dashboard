
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, Trash2 } from "lucide-react";
import { TicketBucket } from "@/types/ticketBuckets";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface BucketItemProps {
  bucket: TicketBucket;
  onDelete: (id: string) => Promise<void>;
  onEdit: (bucket: TicketBucket) => void;
}

export function BucketItem({ bucket, onDelete, onEdit }: BucketItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    try {
      await onDelete(bucket.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <TableRow>
      <TableCell className="font-medium">{bucket.reference_number}</TableCell>
      <TableCell>
        <Badge variant={bucket.bucket_type === 'petit' ? 'outline' : 'secondary'}>
          {bucket.bucket_type === 'petit' ? 'Petit (3-10)' : 'Grande (11-30)'}
        </Badge>
      </TableCell>
      <TableCell>{bucket.access_time || "Not specified"}</TableCell>
      <TableCell>{bucket.max_tickets}</TableCell>
      <TableCell>{bucket.allocated_tickets}</TableCell>
      <TableCell>
        <Badge 
          variant={bucket.available_tickets > 5 ? "secondary" : "outline"}
          className={bucket.available_tickets > 5 
            ? "bg-green-100 text-green-800 hover:bg-green-200" 
            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}
        >
          {bucket.available_tickets}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:text-primary/90 hover:bg-primary/10"
            onClick={() => onEdit(bucket)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        
          <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the ticket bucket with reference number 
                  <span className="font-medium"> {bucket.reference_number}</span>.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

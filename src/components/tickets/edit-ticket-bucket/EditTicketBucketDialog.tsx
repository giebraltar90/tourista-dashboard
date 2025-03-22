
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketBucket } from "@/types/ticketBuckets";
import { useState } from "react";
import { useTicketBucketService } from "@/components/tour-details/ticket-management/services/ticketBucketService";
import { EditTicketBucketForm } from "./EditTicketBucketForm";

interface EditTicketBucketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bucket: TicketBucket;
}

export function EditTicketBucketDialog({ isOpen, onClose, bucket }: EditTicketBucketDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { handleUpdateBucket } = useTicketBucketService();

  const handleSave = async (bucketData: {
    reference_number: string;
    bucket_type: 'petit' | 'grande';
    max_tickets: number;
    access_time: string;
    date: Date;
  }) => {
    setIsSaving(true);
    try {
      const ticketsRange = bucketData.bucket_type === 'petit' ? '3-10' : '11-30';
      const success = await handleUpdateBucket(bucket.id, {
        reference_number: bucketData.reference_number,
        bucket_type: bucketData.bucket_type,
        max_tickets: bucketData.max_tickets,
        tickets_range: ticketsRange,
        access_time: bucketData.access_time || null,
        date: bucketData.date,
      });
      
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ticket Bucket</DialogTitle>
        </DialogHeader>
        
        <EditTicketBucketForm
          bucket={bucket}
          onSave={handleSave}
          onCancel={onClose}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
}

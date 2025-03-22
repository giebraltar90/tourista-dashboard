
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketBucket } from "@/types/ticketBuckets";
import { useTicketBucketService } from "../services/ticketBucketService";
import { EditTicketBucketForm } from "../../../tickets/edit-ticket-bucket/EditTicketBucketForm";

interface EditTicketBucketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bucket: TicketBucket;
}

export const EditTicketBucketDialog = ({ isOpen, onClose, bucket }: EditTicketBucketDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { handleUpdateBucket } = useTicketBucketService();

  // Log when dialog opens with bucket
  useEffect(() => {
    if (isOpen) {
      console.log("🔍 [EditTicketBucketDialog] Dialog opened with bucket:", {
        id: bucket.id,
        reference_number: bucket.reference_number,
        date: bucket.date.toISOString(),
        dateComponents: {
          year: bucket.date.getFullYear(),
          month: bucket.date.getMonth() + 1,
          day: bucket.date.getDate(),
          fullDate: bucket.date.toDateString()
        }
      });
    }
  }, [isOpen, bucket]);

  const handleSave = async (bucketData: {
    reference_number: string;
    bucket_type: 'petit' | 'grande';
    max_tickets: number;
    access_time: string;
    date: Date;
  }) => {
    setIsSaving(true);
    try {
      // Log the data we're about to save
      console.log("🔍 [EditTicketBucketDialog] Saving bucket with data:", {
        ...bucketData,
        date: bucketData.date.toISOString(),
        dateComponents: {
          year: bucketData.date.getFullYear(),
          month: bucketData.date.getMonth() + 1,
          day: bucketData.date.getDate(),
          fullDate: bucketData.date.toDateString()
        }
      });
      
      const ticketsRange = bucketData.bucket_type === 'petit' ? '3-10' : '11-30';
      const success = await handleUpdateBucket(bucket.id, {
        reference_number: bucketData.reference_number,
        bucket_type: bucketData.bucket_type,
        max_tickets: bucketData.max_tickets,
        tickets_range: ticketsRange,
        access_time: bucketData.access_time || null,
        date: bucketData.date,
      });
      
      console.log("🔍 [EditTicketBucketDialog] Update result:", success);
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("🔴 [EditTicketBucketDialog] Error saving bucket:", error);
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
};

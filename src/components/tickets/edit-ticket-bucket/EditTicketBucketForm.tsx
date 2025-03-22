
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketBucket } from "@/types/ticketBuckets";
import { BucketTypeField } from "./BucketTypeField";
import { BucketDateField } from "./BucketDateField";
import { DialogFooter } from "@/components/ui/dialog";

interface EditTicketBucketFormProps {
  bucket: TicketBucket;
  onSave: (bucketData: {
    reference_number: string;
    bucket_type: 'petit' | 'grande';
    max_tickets: number;
    access_time: string;
    date: Date;
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function EditTicketBucketForm({ bucket, onSave, onCancel, isSaving }: EditTicketBucketFormProps) {
  const [referenceNumber, setReferenceNumber] = useState(bucket.reference_number);
  const [bucketType, setBucketType] = useState<'petit' | 'grande'>(bucket.bucket_type);
  const [maxTickets, setMaxTickets] = useState(bucket.max_tickets.toString());
  const [accessTime, setAccessTime] = useState(bucket.access_time || "");
  const [date, setDate] = useState<Date>(bucket.date);

  const handleBucketTypeChange = (value: 'petit' | 'grande') => {
    setBucketType(value);
    // Update max tickets based on the bucket type
    if (value === 'petit' && parseInt(maxTickets) > 10) {
      setMaxTickets('10');
    } else if (value === 'grande' && parseInt(maxTickets) < 11) {
      setMaxTickets('30');
    }
  };

  const handleSave = async () => {
    if (!referenceNumber || !bucketType || !maxTickets || !date) {
      return;
    }

    await onSave({
      reference_number: referenceNumber,
      bucket_type: bucketType,
      max_tickets: parseInt(maxTickets),
      access_time: accessTime || "",
      date: date,
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="reference">Reference Number</Label>
        <Input
          id="reference"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="e.g., VER2304P"
        />
      </div>
      
      <BucketDateField date={date} onDateChange={setDate} />
      
      <BucketTypeField 
        selectedType={bucketType} 
        onTypeChange={handleBucketTypeChange} 
      />
      
      <div className="space-y-2">
        <Label htmlFor="maxTickets">Maximum Tickets</Label>
        <Input
          id="maxTickets"
          type="number"
          value={maxTickets}
          onChange={(e) => setMaxTickets(e.target.value)}
          min={1}
          max={bucketType === 'petit' ? 10 : 30}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accessTime">Access Time (Optional)</Label>
        <Input
          id="accessTime"
          value={accessTime}
          onChange={(e) => setAccessTime(e.target.value)}
          placeholder="e.g., 10:30 AM"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          disabled={!referenceNumber || !bucketType || !maxTickets || !date || isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </div>
  );
}

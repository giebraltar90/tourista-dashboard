
import { useState, useEffect } from "react";
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

  // Log initial bucket values
  useEffect(() => {
    console.log("🔍 [EditTicketBucketForm] Initial bucket:", {
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
  }, [bucket]);

  // Log when date changes
  useEffect(() => {
    console.log("🔍 [EditTicketBucketForm] Date state changed:", {
      date: date.toISOString(),
      dateComponents: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        fullDate: date.toDateString()
      }
    });
  }, [date]);

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

    // Ensure date has noon time to avoid timezone issues
    const saveDate = new Date(date);
    saveDate.setHours(12, 0, 0, 0);

    console.log("🔍 [EditTicketBucketForm] Saving with date:", {
      dateBeforeSave: date.toISOString(),
      saveDate: saveDate.toISOString(),
      dateComponents: {
        year: saveDate.getFullYear(),
        month: saveDate.getMonth() + 1,
        day: saveDate.getDate(),
        fullDate: saveDate.toDateString()
      }
    });

    await onSave({
      reference_number: referenceNumber,
      bucket_type: bucketType,
      max_tickets: parseInt(maxTickets),
      access_time: accessTime || "",
      date: saveDate,
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
      
      <BucketDateField 
        date={date} 
        onDateChange={(newDate) => {
          console.log("🔍 [EditTicketBucketForm] Date changed from picker:", {
            newDate: newDate.toISOString(),
            components: {
              year: newDate.getFullYear(),
              month: newDate.getMonth() + 1, 
              day: newDate.getDate()
            }
          });
          
          // Ensure time is set to noon
          const updatedDate = new Date(newDate);
          updatedDate.setHours(12, 0, 0, 0);
          
          console.log("🔍 [EditTicketBucketForm] Setting date with noon time:", updatedDate.toISOString());
          setDate(updatedDate);
        }} 
      />
      
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


import { Card, CardContent } from "@/components/ui/card";
import { CreateTicketBucketForm } from "../CreateTicketBucketForm";

interface CreateBucketPanelProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateBucketPanel({ onSuccess, onCancel }: CreateBucketPanelProps) {
  return (
    <Card className="border-primary/30 shadow-sm mb-6">
      <CardContent className="pt-6">
        <CreateTicketBucketForm 
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
}

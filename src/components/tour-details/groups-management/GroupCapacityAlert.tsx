
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VentrataTourGroup } from "@/types/ventrata";
import { calculateTotalParticipants } from "@/hooks/group-management/utils/countingService";

interface GroupCapacityAlertProps {
  groups: VentrataTourGroup[];
  maxCapacity: number;
}

export const GroupCapacityAlert = ({ groups, maxCapacity }: GroupCapacityAlertProps) => {
  const totalParticipants = calculateTotalParticipants(groups);
  const isOverCapacity = totalParticipants > maxCapacity;
  
  if (!isOverCapacity) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Tour Over Capacity</AlertTitle>
      <AlertDescription>
        This tour has {totalParticipants} participants, which exceeds the maximum capacity of {maxCapacity}.
        Consider redistributing participants or contacting management for guidance.
      </AlertDescription>
    </Alert>
  );
};

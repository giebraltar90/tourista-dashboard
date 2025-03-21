
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VentrataTourGroup } from "@/types/ventrata";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { calculateTotalParticipants, formatParticipantCount } from "@/hooks/group-management/services/participantService";

interface GroupCapacityAlertProps {
  tourGroups: VentrataTourGroup[];
  isHighSeason: boolean;
}

export const GroupCapacityAlert = ({ tourGroups, isHighSeason }: GroupCapacityAlertProps) => {
  // Early return if no groups
  if (!tourGroups.length) return null;
  
  // Calculate total participants from groups for consistency
  const totalParticipants = calculateTotalParticipants(tourGroups);
  
  // Log calculated participants for debugging
  console.log("COUNTING: GroupCapacityAlert calculations:", {
    totalParticipants, 
    isHighSeason,
    tourGroups: tourGroups.map(g => ({
      name: g.name,
      size: g.size,
      childCount: g.childCount,
      participantCount: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.count || 1), 0) 
        : 'N/A',
      childrenInParticipants: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.childCount || 0), 0) 
        : 'N/A',
    }))
  });
  
  const standardCapacity = DEFAULT_CAPACITY_SETTINGS.standard;
  const highSeasonCapacity = DEFAULT_CAPACITY_SETTINGS.highSeason;
  const capacity = isHighSeason ? highSeasonCapacity : standardCapacity;
  
  // Calculate group imbalance (if difference is more than 25% of average)
  const averageGroupSize = totalParticipants / tourGroups.length;
  const isUnbalanced = tourGroups.some(group => {
    // Calculate actual size from participants if available
    const groupSize = Array.isArray(group.participants) && group.participants.length > 0
      ? group.participants.reduce((sum, p) => sum + (p.count || 1), 0)
      : group.size || 0;
      
    const sizeDifference = Math.abs(groupSize - averageGroupSize);
    const percentDifference = (sizeDifference / averageGroupSize) * 100;
    return percentDifference > 25; // More than 25% difference from average
  });
  
  // Check if exceeding capacity
  const isExceedingCapacity = totalParticipants > capacity;
  
  // Check if groups are appropriately assigned guides
  const unassignedGroups = tourGroups.filter(group => !group.guideId);
  const hasUnassignedGroups = unassignedGroups.length > 0;
  
  // If no issues, don't render anything
  if (!isUnbalanced && !isExceedingCapacity && !hasUnassignedGroups) {
    return null;
  }
  
  return (
    <div className="space-y-2 mb-4">
      {isExceedingCapacity && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Total participants ({totalParticipants}) exceed the {isHighSeason ? "high season" : "standard"} capacity of {capacity}.
          </AlertDescription>
        </Alert>
      )}
      
      {isUnbalanced && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Groups are unbalanced. Consider redistributing participants for a more even distribution.
          </AlertDescription>
        </Alert>
      )}
      
      {hasUnassignedGroups && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {unassignedGroups.length} {unassignedGroups.length === 1 ? 'group is' : 'groups are'} missing guide assignments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

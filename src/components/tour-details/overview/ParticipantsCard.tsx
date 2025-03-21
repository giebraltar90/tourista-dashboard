
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { Badge } from "@/components/ui/badge";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";
import { useMemo } from "react";

interface ParticipantsCardProps {
  tourGroups: VentrataTourGroup[];
  totalParticipants?: number;
  totalChildCount?: number;
  isHighSeason?: boolean;
}

export const ParticipantsCard = ({ 
  tourGroups, 
  totalParticipants: providedTotalParticipants,
  totalChildCount: providedTotalChildCount = 0,
  isHighSeason = false
}: ParticipantsCardProps) => {
  // Calculate participant counts using useMemo to prevent recalculation on every render
  const {
    totalParticipants,
    totalChildCount,
    adultCount,
    formattedParticipantCount
  } = useMemo(() => {
    console.log("PARTICIPANTS DEBUG: ParticipantsCard calculating counts");
    
    // Calculate from actual participants in the database
    let calculatedTotal = 0;
    let calculatedChildren = 0;
    
    // Only count from participants arrays if they exist
    if (Array.isArray(tourGroups)) {
      console.log("PARTICIPANTS DEBUG: Calculating from tour groups");
      for (const group of tourGroups) {
        if (Array.isArray(group.participants) && group.participants.length > 0) {
          for (const participant of group.participants) {
            const count = participant.count || 1;
            const childCount = participant.childCount || 0;
            calculatedTotal += count;
            calculatedChildren += childCount;
          }
        }
      }
    }
    
    // Calculate adult count
    const adultCount = calculatedTotal - calculatedChildren;
    
    console.log("PARTICIPANTS DEBUG: Final calculated values:", {
      calculatedTotal,
      calculatedChildren,
      adultCount: calculatedTotal - calculatedChildren,
      formatted: formatParticipantCount(calculatedTotal, calculatedChildren)
    });
    
    return {
      totalParticipants: calculatedTotal,
      totalChildCount: calculatedChildren,
      adultCount: calculatedTotal - calculatedChildren,
      formattedParticipantCount: formatParticipantCount(calculatedTotal, calculatedChildren)
    };
  }, [tourGroups]);
  
  const totalGroups = Array.isArray(tourGroups) ? tourGroups.length : 0;
  
  // Get capacity and required groups based on season
  const capacity = isHighSeason
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;

  // Determine mode text based on season and participant count
  const getModeText = () => {
    if (isHighSeason) return "High Season";
    if (totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard) return "Exception";
    return "Standard";
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">
              {formattedParticipantCount} participants
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Groups:</span>
            <span className="font-medium">{totalGroups} / {requiredGroups} groups</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium">
              {totalParticipants} / {capacity}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode:</span>
            <Badge 
              variant="outline" 
              className={`font-medium ${
                isHighSeason
                  ? "bg-blue-100 text-blue-800" 
                  : totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {getModeText()} Mode
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

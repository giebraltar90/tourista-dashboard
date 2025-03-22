
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { Badge } from "@/components/ui/badge";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

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
    console.log("DATABASE DEBUG: ParticipantsCard calculating counts with groups:", {
      tourGroupsLength: tourGroups.length,
      tourGroupsWithParticipants: tourGroups.filter(g => 
        Array.isArray(g.participants) && g.participants.length > 0
      ).length
    });
    
    // Calculate actual participant counts from the data
    let calculatedTotalParticipants = 0;
    let calculatedTotalChildCount = 0;
    
    if (Array.isArray(tourGroups)) {
      for (const group of tourGroups) {
        if (Array.isArray(group.participants) && group.participants.length > 0) {
          // Count directly from participants array
          for (const participant of group.participants) {
            calculatedTotalParticipants += participant.count || 1;
            calculatedTotalChildCount += participant.childCount || 0;
          }
        } else if (group.size > 0) {
          // Use size as fallback
          calculatedTotalParticipants += group.size;
          calculatedTotalChildCount += group.childCount || 0;
        }
      }
    }
    
    // Use provided values as fallback if our calculation is 0
    const finalTotalParticipants = calculatedTotalParticipants > 0 
      ? calculatedTotalParticipants 
      : (providedTotalParticipants || 0);
      
    const finalChildCount = calculatedTotalChildCount > 0 
      ? calculatedTotalChildCount 
      : (providedTotalChildCount || 0);
    
    const finalAdultCount = finalTotalParticipants - finalChildCount;
    
    // Format the display string
    const formatted = formatParticipantCount(finalTotalParticipants, finalChildCount);
    
    return {
      totalParticipants: finalTotalParticipants,
      totalChildCount: finalChildCount,
      adultCount: finalAdultCount,
      formattedParticipantCount: formatted
    };
  }, [tourGroups, providedTotalParticipants, providedTotalChildCount]);
  
  const totalGroups = Array.isArray(tourGroups) ? tourGroups.length : 0;
  
  // Get capacity and required groups based on season
  const capacity = isHighSeason
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;

  // Determine if groups are below required minimum
  const isBelowMinimumGroups = totalGroups < requiredGroups;
  
  // Check if we're near capacity (>80%)
  const capacityPercentage = Math.round((totalParticipants / capacity) * 100);
  const isNearCapacity = capacityPercentage > 80;
  
  // Determine mode text based on season and participant count
  const getModeText = () => {
    if (isHighSeason) return "High Season";
    if (totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard) return "Exception";
    return "Standard";
  };
  
  // Determine badge color based on capacity percentage
  const getCapacityBadgeClass = () => {
    if (capacityPercentage > 95) return "bg-red-100 text-red-800 border-red-300";
    if (capacityPercentage > 80) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-green-100 text-green-800 border-green-300";
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total:</span>
            <Badge variant="outline" className={`font-medium ${getCapacityBadgeClass()}`}>
              {formattedParticipantCount} participants
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Groups:</span>
            <Badge variant="outline" 
              className={`font-medium ${isBelowMinimumGroups 
                ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                : "bg-green-100 text-green-800 border-green-300"}`}
            >
              {isBelowMinimumGroups && <AlertTriangle className="h-3 w-3 mr-1" />}
              {totalGroups} / {requiredGroups} groups
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Capacity:</span>
            <Badge variant="outline" className={`font-medium ${getCapacityBadgeClass()}`}>
              {totalParticipants} / {capacity}
              {isNearCapacity && <span className="ml-1">({capacityPercentage}%)</span>}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Mode:</span>
            <Badge 
              variant="outline" 
              className={`font-medium ${
                isHighSeason
                  ? "bg-blue-100 text-blue-800 border-blue-300" 
                  : totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-green-100 text-green-800 border-green-300"
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

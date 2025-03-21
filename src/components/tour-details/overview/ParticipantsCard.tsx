
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
    
    // Extra detailed logging of input data
    console.log("PARTICIPANTS DEBUG: ParticipantsCard input data:", {
      providedTotalParticipants,
      providedTotalChildCount,
      isHighSeason,
      tourGroupsCount: tourGroups?.length || 0,
      tourGroupsDetails: Array.isArray(tourGroups) ? tourGroups.map(g => ({
        id: g.id,
        name: g.name || 'Unnamed',
        size: g.size,
        childCount: g.childCount,
        hasParticipantsArray: Array.isArray(g.participants),
        participantsCount: Array.isArray(g.participants) ? g.participants.length : 0,
        participants: Array.isArray(g.participants) ? g.participants.map(p => ({
          name: p.name,
          count: p.count || 1,
          childCount: p.childCount || 0
        })) : []
      })) : 'No tour groups'
    });
    
    // Use provided values if they exist and are greater than 0
    if (
      providedTotalParticipants !== undefined && 
      providedTotalParticipants > 0 &&
      providedTotalChildCount !== undefined &&
      providedTotalChildCount >= 0
    ) {
      console.log("PARTICIPANTS DEBUG: Using provided values:", providedTotalParticipants, providedTotalChildCount);
      const adult = providedTotalParticipants - providedTotalChildCount;
      return {
        totalParticipants: providedTotalParticipants,
        totalChildCount: providedTotalChildCount,
        adultCount: adult,
        formattedParticipantCount: formatParticipantCount(providedTotalParticipants, providedTotalChildCount)
      };
    }
    
    // Calculate from scratch if no valid provided values
    let calculatedTotal = 0;
    let calculatedChildren = 0;
    
    // Only count from participants arrays if they exist
    if (Array.isArray(tourGroups)) {
      console.log("PARTICIPANTS DEBUG: Manually calculating from tour groups");
      for (const group of tourGroups) {
        console.log(`PARTICIPANTS DEBUG: Processing group ${group.name || 'Unnamed'}:`, {
          id: group.id,
          hasParticipants: Array.isArray(group.participants),
          participantsCount: Array.isArray(group.participants) ? group.participants.length : 0,
          size: group.size,
          childCount: group.childCount
        });
        
        if (Array.isArray(group.participants) && group.participants.length > 0) {
          for (const participant of group.participants) {
            const count = participant.count || 1;
            const childCount = participant.childCount || 0;
            calculatedTotal += count;
            calculatedChildren += childCount;
            
            console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}":`, {
              count,
              childCount,
              runningTotal: calculatedTotal,
              runningChildren: calculatedChildren
            });
          }
        } else if (group.size > 0) {
          // If no participants but group.size exists, use that as fallback
          calculatedTotal += group.size;
          calculatedChildren += group.childCount || 0;
          
          console.log(`PARTICIPANTS DEBUG: Using group.size fallback:`, {
            size: group.size,
            childCount: group.childCount || 0,
            runningTotal: calculatedTotal,
            runningChildren: calculatedChildren
          });
        }
      }
    }
    
    // Calculate adult count
    const adultCount = calculatedTotal - calculatedChildren;
    
    // If after calculation we still have 0, try to use group.size as fallback
    if (calculatedTotal === 0 && Array.isArray(tourGroups)) {
      console.log("PARTICIPANTS DEBUG: No participants found, using group.size as final fallback");
      calculatedTotal = tourGroups.reduce((sum, g) => sum + (g.size || 0), 0);
      calculatedChildren = tourGroups.reduce((sum, g) => sum + (g.childCount || 0), 0);
    }
    
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
  }, [tourGroups, providedTotalParticipants, providedTotalChildCount]);
  
  const totalGroups = tourGroups.length;
  
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
  
  // Log final values once after calculation
  console.log("PARTICIPANTS DEBUG: ParticipantsCard final values:", { 
    totalParticipants,
    totalChildCount,
    adultCount,
    formattedParticipantCount,
    capacity,
    isHighSeason
  });
  
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

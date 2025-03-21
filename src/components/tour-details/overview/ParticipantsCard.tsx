
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { Badge } from "@/components/ui/badge";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

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
  console.log("PARTICIPANTS DEBUG: ParticipantsCard starting with raw inputs:", {
    tourGroupsCount: tourGroups.length,
    providedTotalParticipants,
    providedTotalChildCount,
    isHighSeason
  });
  
  // CRITICAL DEBUG: Log complete tour groups data
  console.log("PARTICIPANTS DEBUG: ParticipantsCard full tourGroups data:", 
    tourGroups.map(g => ({
      id: g.id,
      name: g.name || 'Unnamed',
      size: g.size,
      childCount: g.childCount,
      hasParticipantsArray: Array.isArray(g.participants),
      participantsLength: Array.isArray(g.participants) ? g.participants.length : 0,
      participants: Array.isArray(g.participants) ? g.participants.map(p => ({
        id: p.id,
        name: p.name,
        count: p.count || 1,
        childCount: p.childCount || 0
      })) : []
    }))
  );
  
  // CRITICAL BUGFIX: Use provided values if they exist and are greater than 0
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  // Only calculate if provided values aren't already available
  if (providedTotalParticipants === undefined || providedTotalParticipants <= 0) {
    // FIX: ONLY count from participants array and IGNORE the size property completely
    for (const group of tourGroups) {
      if (Array.isArray(group.participants) && group.participants.length > 0) {
        let groupTotal = 0;
        let groupChildCount = 0;
        
        console.log(`PARTICIPANTS DEBUG: Processing group "${group.name || 'Unnamed'}" participants:`, 
          group.participants.map(p => ({ 
            name: p.name, 
            count: p.count || 1, 
            childCount: p.childCount || 0 
          }))
        );
        
        // Count directly from participants array - ONE by ONE
        for (const participant of group.participants) {
          const count = participant.count || 1;
          const childCount = participant.childCount || 0;
          
          groupTotal += count;
          groupChildCount += childCount;
          
          console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}" to group "${group.name || 'Unnamed'}":`, {
            count,
            childCount,
            groupRunningTotal: groupTotal,
            groupRunningChildCount: groupChildCount
          });
        }
        
        calculatedTotalParticipants += groupTotal;
        calculatedTotalChildCount += groupChildCount;
        
        console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" final counts:`, {
          groupId: group.id,
          groupTotal,
          groupChildCount,
          overallRunningTotal: calculatedTotalParticipants,
          overallRunningChildCount: calculatedTotalChildCount
        });
      } else {
        console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants array or it's empty`);
        
        // If no participants data, fall back to the group size
        if (group.size && group.size > 0) {
          calculatedTotalParticipants += group.size;
          calculatedTotalChildCount += group.childCount || 0;
          
          console.log(`PARTICIPANTS DEBUG: Using group size as fallback: ${group.size} (child: ${group.childCount || 0})`);
        }
      }
    }
  }
  
  // Use provided values if they exist, otherwise use calculated values
  const totalParticipants = (providedTotalParticipants !== undefined && providedTotalParticipants > 0) 
    ? providedTotalParticipants 
    : calculatedTotalParticipants;
    
  const totalChildCount = (providedTotalChildCount !== undefined && providedTotalChildCount > 0)
    ? providedTotalChildCount
    : calculatedTotalChildCount;
  
  // Calculate adult count (total minus children)
  const adultCount = totalParticipants - totalChildCount;
  
  const totalGroups = tourGroups.length;
  
  // Format participant count to show adults + children if there are children
  const formattedParticipantCount = formatParticipantCount(totalParticipants, totalChildCount);
  
  // CRITICAL FIX: Use strict equality to ensure proper boolean handling
  const capacity = isHighSeason === true
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  // CRITICAL FIX: Use strict equality for determining required groups
  const requiredGroups = isHighSeason === true
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;

  // CRITICAL FIX: Improve mode text determination with strict comparisons
  const getModeText = () => {
    if (isHighSeason === true) return "High Season";
    if (totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard) return "Exception";
    return "Standard";
  };
  
  // Ultra detailed log for final calculations
  console.log("PARTICIPANTS DEBUG: ParticipantsCard final calculations:", { 
    calculatedTotalParticipants,
    calculatedTotalChildCount,
    finalTotalParticipants: totalParticipants,
    finalTotalChildCount: totalChildCount,
    adultCount,
    formattedParticipantCount,
    isHighSeason,
    capacity,
    requiredGroups
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
                isHighSeason === true
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

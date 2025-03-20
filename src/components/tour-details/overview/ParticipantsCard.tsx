
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
  // CRITICAL BUGFIX: Reset calculation and do a fresh count
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  console.log("MEGA DEBUG: ParticipantsCard starting calculation with groups:", {
    tourGroupsCount: tourGroups.length,
    rawGroups: tourGroups.map(g => ({
      id: g.id,
      name: g.name,
      size: g.size,
      childCount: g.childCount,
      participantsCount: Array.isArray(g.participants) ? g.participants.length : 0
    }))
  });
  
  // FIX: ONLY count from participants array and IGNORE the size property completely
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      let groupChildCount = 0;
      
      // Special debug for every single participant
      console.log(`ULTRA DEBUG: Group "${group.name}" participant details:`, 
        group.participants.map(p => ({ 
          name: p.name, 
          count: p.count, 
          childCount: p.childCount 
        }))
      );
      
      // Count directly from participants array - ONE by ONE
      for (const participant of group.participants) {
        const count = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        groupTotal += count;
        groupChildCount += childCount;
        
        console.log(`ULTRA DEBUG: Adding participant "${participant.name}": count=${count}, childCount=${childCount}`);
      }
      
      calculatedTotalParticipants += groupTotal;
      calculatedTotalChildCount += groupChildCount;
      
      console.log(`MEGA DEBUG: ParticipantsCard group "${group.name || 'unnamed'}" final calculation:`, {
        groupId: group.id,
        groupParticipantCount: group.participants.length,
        groupTotal,
        groupChildCount
      });
    }
    // CRITICAL FIX: Remove the fallback to size property completely
  }
  
  // Use calculated values, fall back to provided values if calculation fails
  const totalParticipants = calculatedTotalParticipants || providedTotalParticipants || 0;
  const totalChildCount = calculatedTotalChildCount || providedTotalChildCount || 0;
  
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
  
  // Ultra detailed log for troubleshooting
  console.log("ULTRA DEBUG: ParticipantsCard final calculations:", { 
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

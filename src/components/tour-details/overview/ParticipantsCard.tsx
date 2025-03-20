
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
  // BUGFIX: Calculate participants directly from participants array
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  // BUGFIX: Count each actual participant for accurate totals
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Count directly from participants array
      for (const participant of group.participants) {
        calculatedTotalParticipants += participant.count || 1;
        calculatedTotalChildCount += participant.childCount || 0;
      }
      
      console.log(`BUGFIX: ParticipantsCard group ${group.name || 'unnamed'} direct calculation:`, {
        directParticipants: group.participants.reduce((sum, p) => sum + (p.count || 1), 0),
        directChildren: group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0),
        participantCount: group.participants.length
      });
    } else if (group.size) {
      // Only fallback to size properties when absolutely necessary
      console.log(`BUGFIX: ParticipantsCard no participants for group ${group.name || 'unnamed'}, using size:`, {
        size: group.size,
        childCount: group.childCount || 0
      });
      
      calculatedTotalParticipants += group.size;
      calculatedTotalChildCount += group.childCount || 0;
    }
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
    : totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard 
      ? DEFAULT_CAPACITY_SETTINGS.exception 
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
  
  // Detailed log for troubleshooting
  console.log("BUGFIX: ParticipantsCard final calculations:", { 
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

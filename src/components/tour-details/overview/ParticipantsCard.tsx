
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { Badge } from "@/components/ui/badge";

interface ParticipantsCardProps {
  tourGroups: VentrataTourGroup[];
  totalParticipants: number;
  isHighSeason?: boolean;
}

export const ParticipantsCard = ({ 
  tourGroups, 
  totalParticipants,
  isHighSeason = false
}: ParticipantsCardProps) => {
  const totalGroups = tourGroups.length;
  
  // CRITICAL FIX: Use strict equality to ensure proper boolean handling
  // Since isHighSeason is now explicitly boolean, we can use strict comparison
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
  
  // Debug log for troubleshooting
  console.log("ParticipantsCard props:", { 
    isHighSeason, 
    totalParticipants, 
    capacity, 
    requiredGroups,
    mode: getModeText()
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
            <span className="font-medium">{totalParticipants} participants</span>
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
};

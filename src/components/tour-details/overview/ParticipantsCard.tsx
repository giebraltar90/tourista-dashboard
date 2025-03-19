
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";

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
  const capacity = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeason : 
    totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard ? 
      DEFAULT_CAPACITY_SETTINGS.exception : 
      DEFAULT_CAPACITY_SETTINGS.standard;
  
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
            <span className="font-medium">{totalGroups} groups</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-medium">
              {totalParticipants} / {capacity}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

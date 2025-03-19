
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";

interface ParticipantsCardProps {
  tourGroups: VentrataTourGroup[];
  totalParticipants: number;
}

export const ParticipantsCard = ({ tourGroups, totalParticipants }: ParticipantsCardProps) => {
  const totalGroups = tourGroups.length;
  
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
              {totalParticipants} / {totalGroups > 2 ? '36' : '24'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

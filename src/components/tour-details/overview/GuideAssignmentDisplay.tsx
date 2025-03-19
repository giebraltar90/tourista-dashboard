
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, IdCard, Users } from "lucide-react";
import { format } from "date-fns";
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";

interface GuideAssignmentDisplayProps {
  guideName: string;
  guideInfo: GuideInfo | null;
  guideId: string;
  isPrimary: boolean;
  tourGroups: VentrataTourGroup[];
  getGuideTypeBadgeColor: (guideType?: string) => string;
}

export const GuideAssignmentDisplay = ({
  guideName,
  guideInfo,
  guideId,
  isPrimary,
  tourGroups,
  getGuideTypeBadgeColor
}: GuideAssignmentDisplayProps) => {
  if (!guideName) return null;

  return (
    <div className="flex items-start space-x-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <Users className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-medium">{guideName}</h3>
        <p className="text-sm text-muted-foreground">
          {isPrimary ? "Primary Guide" : (guideId === "guide2" ? "Secondary Guide" : "Assistant Guide")}
        </p>
        
        {guideInfo && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center text-sm">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{format(guideInfo.birthday, 'MMMM d, yyyy')}</span>
            </div>
            <Badge variant="outline" className={getGuideTypeBadgeColor(guideInfo.guideType)}>
              <IdCard className="h-3.5 w-3.5 mr-1.5" />
              {guideInfo.guideType}
            </Badge>
          </div>
        )}
        
        {/* Show which group this guide is assigned to */}
        {tourGroups.map((group, index) => {
          if (group.guideId === guideId || (guideName && group.guideId === guideName)) {
            return (
              <Badge key={index} className="mt-2 bg-green-100 text-green-800 border-green-300">
                Assigned to Group {index + 1}
              </Badge>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo, Guide } from "@/types/ventrata";
import { GroupsList } from "./GroupsList";
import { logger } from "@/utils/logger";

interface TourGroupsSectionProps {
  tourGroups: VentrataTourGroup[];
  tourId: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourGroupsSection = ({
  tourGroups,
  tourId,
  guide1Info = null,
  guide2Info = null,
  guide3Info = null
}: TourGroupsSectionProps) => {
  // Log guide info for debugging
  React.useEffect(() => {
    logger.debug("TourGroupsSection received guide info:", {
      guide1: guide1Info ? { 
        name: guide1Info.name, 
        type: guide1Info.guideType
      } : null,
      guide2: guide2Info ? { 
        name: guide2Info.name, 
        type: guide2Info.guideType
      } : null,
      guide3: guide3Info ? { 
        name: guide3Info.name, 
        type: guide3Info.guideType
      } : null
    });
  }, [guide1Info, guide2Info, guide3Info]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Tour Groups</CardTitle>
      </CardHeader>
      <CardContent>
        <GroupsList 
          groups={tourGroups}
          tourId={tourId}
          guide1Info={guide1Info}
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </CardContent>
    </Card>
  );
};

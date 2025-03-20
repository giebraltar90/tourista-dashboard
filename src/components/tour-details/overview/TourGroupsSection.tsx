
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useState } from "react";

interface TourGroupsSectionProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourGroupsSection = ({ 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info 
}: TourGroupsSectionProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  
  // Ensure we have tour groups
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Groups & Guides</CardTitle>
      </CardHeader>
      <CardContent>
        {tourGroups.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No tour groups available
          </div>
        ) : (
          <div className="space-y-4">
            {tourGroups.map((group, index) => {
              const { name: guideName } = getGuideNameAndInfo(group.guideId);
              const isExpanded = expandedGroup === group.id;
              
              return (
                <div 
                  key={group.id || index}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="bg-muted/30 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{group.name || `Group ${index + 1}`}</h3>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm text-muted-foreground">
                        {guideName ? (
                          <span className="font-medium">{guideName}</span>
                        ) : (
                          <span className="italic">No guide assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

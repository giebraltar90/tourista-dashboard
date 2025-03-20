
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

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
  
  // Log all group data for debugging
  const groupDetailsForLogging = tourGroups.map(g => {
    // Calculate participant counts directly from participants array
    const participantCount = Array.isArray(g.participants) && g.participants.length > 0
      ? g.participants.reduce((sum, p) => sum + (p.count || 1), 0)
      : g.size || 0;
      
    const childCount = Array.isArray(g.participants) && g.participants.length > 0
      ? g.participants.reduce((sum, p) => sum + (p.childCount || 0), 0)
      : g.childCount || 0;
      
    return {
      name: g.name,
      size: g.size,
      childCount: g.childCount,
      calculatedParticipantCount: participantCount,
      calculatedChildCount: childCount,
      displayParticipants: formatParticipantCount(participantCount, childCount),
      participantsArray: Array.isArray(g.participants) ? g.participants.length : 'N/A',
      participantDetails: Array.isArray(g.participants) 
        ? g.participants.map(p => ({ name: p.name, count: p.count || 1, childCount: p.childCount || 0 }))
        : 'N/A'
    };
  });
  
  console.log("COUNTING: TourGroupsSection detailed group analysis:", groupDetailsForLogging);

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
                      <div className="text-sm text-muted-foreground mr-4">
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

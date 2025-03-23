
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { Button } from "@/components/ui/button";
import { AssignGuideDialog } from "../groups-management/dialogs/AssignGuideDialog";
import { useGuideData } from "@/hooks/guides";
import { TourCardProps } from "@/components/tours/tour-card/types";

interface TourGroupsSectionProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourGroupsSection = ({ 
  tour, 
  isHighSeason,
  guide1Info = null, 
  guide2Info = null, 
  guide3Info = null 
}: TourGroupsSectionProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { guides = [] } = useGuideData();
  
  // State for guide assignment dialog
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  
  // Ensure we have tour groups
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };
  
  // Open the guide assignment dialog
  const handleAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  // Get valid guide options - making sure each guide has all required properties
  const validGuides = guides.map(guide => ({
    id: guide.id,
    name: guide.name,
    info: guide
  }));
  
  // Add special guides if they exist in the tour
  if (tour.guide1 && !validGuides.some(g => g.id === tour.guide1)) {
    validGuides.push({
      id: "guide1",
      name: tour.guide1,
      info: guide1Info ? {
        ...guide1Info,
        id: guide1Info.id || "guide1"
      } : null
    });
  }
  
  if (tour.guide2 && !validGuides.some(g => g.id === tour.guide2)) {
    validGuides.push({
      id: "guide2",
      name: tour.guide2,
      info: guide2Info ? {
        ...guide2Info,
        id: guide2Info.id || "guide2"
      } : null
    });
  }
  
  if (tour.guide3 && !validGuides.some(g => g.id === tour.guide3)) {
    validGuides.push({
      id: "guide3",
      name: tour.guide3,
      info: guide3Info ? {
        ...guide3Info,
        id: guide3Info.id || "guide3"
      } : null
    });
  }

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
              
              // Create group display name with guide in parentheses if assigned
              const displayName = guideName && guideName !== "Unassigned" 
                ? `Group ${index + 1} (${guideName})`
                : `Group ${index + 1}`;
              
              return (
                <div 
                  key={group.id || index}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="bg-muted/30 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{displayName}</h3>
                    </div>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAssignGuide(index)}
                      >
                        {guideName && guideName !== "Unassigned" ? "Change Guide" : "Assign Guide"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Guide Assignment Dialog */}
        {isAssignGuideOpen && selectedGroupIndex >= 0 && tourGroups[selectedGroupIndex] && (
          <AssignGuideDialog
            isOpen={isAssignGuideOpen}
            onOpenChange={setIsAssignGuideOpen}
            tourId={tour.id}
            groupIndex={selectedGroupIndex}
            guides={validGuides}
            currentGuideId={tourGroups[selectedGroupIndex].guideId}
          />
        )}
      </CardContent>
    </Card>
  );
};

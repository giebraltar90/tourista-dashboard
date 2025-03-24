
import { useState } from "react";
import { GroupCard } from "./GroupCard";

interface GroupsListProps {
  tourGroups: any[];
  getGuideNameAndInfo: (guideId?: string) => { name: string; info: any };
  tourId: string;
  handleAssignGuide: (groupIndex: number) => void;
}

export const GroupsList = ({
  tourGroups,
  getGuideNameAndInfo,
  tourId,
  handleAssignGuide
}: GroupsListProps) => {
  if (tourGroups.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No tour groups available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tourGroups.map((group, index) => {
        const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
        
        return (
          <GroupCard 
            key={group.id || index}
            index={index}
            group={group}
            tourId={tourId}
            guideName={guideName}
            guideInfo={guideInfo}
            handleAssignGuide={handleAssignGuide}
          />
        );
      })}
    </div>
  );
};

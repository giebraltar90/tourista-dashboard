
import { useState, useEffect } from "react";
import { useAssignGuide } from "@/hooks/group-management";
import { GuideSelectionPopover } from "./GuideSelectionPopover";
import { useQueryClient } from "@tanstack/react-query";
import { AssignGuideProvider } from "./assign-guide/AssignGuideProvider";

interface AssignGuideButtonProps {
  tourId: string;
  guideId: string;
  guideName?: string;
  groupIndex: number;
  guides: Array<{
    id: string;
    name: string;
    info: any;
  }>;
  displayName: string;
}

export const AssignGuideButton = (props: AssignGuideButtonProps) => {
  return (
    <AssignGuideProvider {...props}>
      <GuideSelectionButton />
    </AssignGuideProvider>
  );
};

// This component handles the UI rendering logic
function GuideSelectionButton() {
  const {
    isGuideAssigned,
    isAssigning,
    localGuideId,
    handleAssignGuide,
    guides,
    displayName
  } = useAssignGuideContext();
  
  return (
    <GuideSelectionPopover
      isGuideAssigned={isGuideAssigned}
      isAssigning={isAssigning}
      selectedGuide={localGuideId || "_none"}
      guideOptions={guides}
      onAssignGuide={handleAssignGuide}
      displayName={displayName}
    />
  );
}

// Consuming component that uses the context
export function useAssignGuideContext() {
  return AssignGuideProvider.useContext();
}

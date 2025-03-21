
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { AddGroupDialog } from "./dialogs/AddGroupDialog";
import { EditGroupDialog } from "./dialogs/EditGroupDialog";
import { AssignGuideDialog } from "./dialogs/AssignGuideDialog";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { useEffect, useState } from "react";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

interface GroupDialogsProps {
  tourId: string;
  tour: any;
  selectedGroupIndex: number | null;
  isAddGroupOpen: boolean;
  setIsAddGroupOpen: (open: boolean) => void;
  isEditGroupOpen: boolean;
  setIsEditGroupOpen: (open: boolean) => void;
  isAssignGuideOpen: boolean;
  setIsAssignGuideOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  handleDeleteGroup: () => Promise<void>;
  isDeleting: boolean;
}

export const GroupDialogs = ({
  tourId,
  tour,
  selectedGroupIndex,
  isAddGroupOpen,
  setIsAddGroupOpen,
  isEditGroupOpen,
  setIsEditGroupOpen,
  isAssignGuideOpen,
  setIsAssignGuideOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  guide1Info,
  guide2Info,
  guide3Info,
  handleDeleteGroup,
  isDeleting
}: GroupDialogsProps) => {
  const { guides: allGuides = [] } = useGuideData() || { guides: [] };
  const [validGuides, setValidGuides] = useState<any[]>([]);
  
  // Prepare guide data when component mounts or dependencies change
  useEffect(() => {
    // Create an array of valid guides with properly formatted IDs
    const guides = [];
    
    console.log("GUIDE SELECT DEBUG: Preparing guides for selection dialog", {
      dbGuidesCount: allGuides.length,
      primaryGuides: {
        guide1: tour.guide1 ? { name: tour.guide1, guideType: guide1Info?.guideType } : null,
        guide2: tour.guide2 ? { name: tour.guide2, guideType: guide2Info?.guideType } : null,
        guide3: tour.guide3 ? { name: tour.guide3, guideType: guide3Info?.guideType } : null,
      }
    });
    
    // Add all guides from the database first
    if (Array.isArray(allGuides)) {
      allGuides.forEach(dbGuide => {
        if (dbGuide.name && dbGuide.id) {
          // Avoid duplicating any guides already in the list
          if (!guides.some(g => g.id === dbGuide.id)) {
            guides.push({ 
              id: dbGuide.id, 
              name: dbGuide.name, 
              info: dbGuide 
            });
            console.log(`GUIDE SELECT DEBUG: Added DB guide: ${dbGuide.name}, guideType: ${dbGuide.guideType}`);
          }
        }
      });
    }
    
    // Primary guides - use consistent IDs but look for DB matches first
    if (tour.guide1) {
      // Try to find a database guide with this name or ID
      const dbGuide1 = allGuides.find(g => 
        g.name === tour.guide1 || 
        (isValidUuid(tour.guide1) && g.id === tour.guide1)
      );
      
      if (dbGuide1 && isValidUuid(dbGuide1.id)) {
        if (!guides.some(g => g.id === dbGuide1.id)) {
          guides.push({
            id: dbGuide1.id,
            name: dbGuide1.name,
            info: guide1Info || dbGuide1
          });
          console.log(`GUIDE SELECT DEBUG: Added guide1 from DB match: ${dbGuide1.name}, guideType: ${dbGuide1.guideType}`);
        }
      } else {
        // If the guide ID is already a UUID, use it directly
        if (isValidUuid(tour.guide1)) {
          guides.push({ 
            id: tour.guide1, 
            name: guide1Info?.name || `Guide ${tour.guide1.substring(0, 6)}...`, 
            info: guide1Info 
          });
          console.log(`GUIDE SELECT DEBUG: Added guide1 as UUID: ${tour.guide1}, name: ${guide1Info?.name || 'Unknown'}`);
        } else {
          // Fall back to guide1 ID
          guides.push({ 
            id: "guide1", 
            name: tour.guide1, 
            info: guide1Info 
          });
          console.log(`GUIDE SELECT DEBUG: Added guide1 as named guide: ${tour.guide1}, guideType: ${guide1Info?.guideType}`);
        }
      }
    }
    
    if (tour.guide2) {
      // Try to find a database guide with this name or ID
      const dbGuide2 = allGuides.find(g => 
        g.name === tour.guide2 || 
        (isValidUuid(tour.guide2) && g.id === tour.guide2)
      );
      
      if (dbGuide2 && isValidUuid(dbGuide2.id)) {
        if (!guides.some(g => g.id === dbGuide2.id)) {
          guides.push({
            id: dbGuide2.id,
            name: dbGuide2.name,
            info: guide2Info || dbGuide2
          });
          console.log(`GUIDE SELECT DEBUG: Added guide2 from DB match: ${dbGuide2.name}, guideType: ${dbGuide2.guideType}`);
        }
      } else {
        // If the guide ID is already a UUID, use it directly
        if (isValidUuid(tour.guide2)) {
          guides.push({ 
            id: tour.guide2, 
            name: guide2Info?.name || `Guide ${tour.guide2.substring(0, 6)}...`, 
            info: guide2Info 
          });
          console.log(`GUIDE SELECT DEBUG: Added guide2 as UUID: ${tour.guide2}, name: ${guide2Info?.name || 'Unknown'}`);
        } else {
          // Fall back to guide2 ID
          guides.push({ 
            id: "guide2", 
            name: tour.guide2, 
            info: guide2Info 
          });
          console.log(`GUIDE SELECT DEBUG: Added guide2 as named guide: ${tour.guide2}, guideType: ${guide2Info?.guideType}`);
        }
      }
    }
    
    if (tour.guide3) {
      // Try to find a database guide with this name or ID
      const dbGuide3 = allGuides.find(g => 
        g.name === tour.guide3 || 
        (isValidUuid(tour.guide3) && g.id === tour.guide3)
      );
      
      if (dbGuide3 && isValidUuid(dbGuide3.id)) {
        if (!guides.some(g => g.id === dbGuide3.id)) {
          guides.push({
            id: dbGuide3.id,
            name: dbGuide3.name,
            info: guide3Info || dbGuide3
          });
          console.log(`GUIDE SELECT DEBUG: Added guide3 from DB match: ${dbGuide3.name}, guideType: ${dbGuide3.guideType}`);
        }
      } else {
        // If the guide ID is already a UUID, use it directly
        if (isValidUuid(tour.guide3)) {
          guides.push({ 
            id: tour.guide3, 
            name: guide3Info?.name || `Guide ${tour.guide3.substring(0, 6)}...`, 
            info: guide3Info 
          });
          console.log(`GUIDE SELECT DEBUG: Added guide3 as UUID: ${tour.guide3}, name: ${guide3Info?.name || 'Unknown'}`);
        } else {
          // Fall back to guide3 ID
          guides.push({ 
            id: "guide3", 
            name: tour.guide3, 
            info: guide3Info 
          });
          console.log(`GUIDE SELECT DEBUG: Added guide3 as named guide: ${tour.guide3}, guideType: ${guide3Info?.guideType}`);
        }
      }
    }
    
    // Filter out any guides with empty names or IDs
    const filtered = guides.filter(guide => guide.name && guide.id);
    
    // Sort guides alphabetically by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log("GUIDE SELECT DEBUG: Prepared valid guides for GroupDialogs:", 
      filtered.map(g => ({ id: g.id, name: g.name, guideType: g.info?.guideType }))
    );
    
    setValidGuides(filtered);
  }, [tour, guide1Info, guide2Info, guide3Info, allGuides]);
  
  return (
    <>
      <AddGroupDialog
        tourId={tourId}
        isOpen={isAddGroupOpen}
        onOpenChange={setIsAddGroupOpen}
      />
      
      {selectedGroupIndex !== null && tour.tourGroups[selectedGroupIndex] && (
        <EditGroupDialog
          tourId={tourId}
          group={tour.tourGroups[selectedGroupIndex]}
          groupIndex={selectedGroupIndex}
          isOpen={isEditGroupOpen}
          onOpenChange={setIsEditGroupOpen}
        />
      )}
      
      {selectedGroupIndex !== null && tour.tourGroups[selectedGroupIndex] && (
        <AssignGuideDialog
          tourId={tourId}
          groupIndex={selectedGroupIndex}
          guides={validGuides}
          currentGuideId={tour.tourGroups[selectedGroupIndex].guideId || "_none"}
          isOpen={isAssignGuideOpen}
          onOpenChange={setIsAssignGuideOpen}
        />
      )}
      
      <DeleteGroupDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        onConfirmDelete={handleDeleteGroup}
      />
    </>
  );
};

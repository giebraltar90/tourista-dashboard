
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, UserPlus, Users } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { AddGroupForm } from "./AddGroupForm";
import { EditGroupForm } from "./EditGroupForm";
import { AssignGuideForm } from "./AssignGuideForm";

interface GroupsListProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const GroupsList = ({ tour, guide1Info, guide2Info, guide3Info }: GroupsListProps) => {
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  
  const handleGroupAction = (index: number, action: 'edit' | 'assignGuide') => {
    setSelectedGroupIndex(index);
    if (action === 'edit') {
      setIsEditGroupOpen(true);
    } else {
      setIsAssignGuideOpen(true);
    }
  };
  
  // Helper to get guide name for display
  const getGuideNameAndInfo = (guideId?: string) => {
    if (!guideId) return { name: "Unassigned", info: null };
    
    if (guide1Info && (guide1Info.id === guideId || guideId === "guide1")) {
      return { name: tour.guide1, info: guide1Info };
    } else if (guide2Info && (guide2Info.id === guideId || guideId === "guide2")) {
      return { name: tour.guide2 || "", info: guide2Info };
    } else if (guide3Info && (guide3Info.id === guideId || guideId === "guide3")) {
      return { name: tour.guide3 || "", info: guide3Info };
    }
    
    return { name: "Unassigned", info: null };
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Groups ({tour.tourGroups.length})</h3>
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-1" /> Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Group</DialogTitle>
              <DialogDescription>
                Create a new group and assign a guide to it.
              </DialogDescription>
            </DialogHeader>
            <AddGroupForm 
              tourId={tour.id} 
              onSuccess={() => setIsAddGroupOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {tour.tourGroups.map((group, index) => {
          const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
          
          return (
            <div key={index} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">{group.name}</h4>
                    <Badge className="ml-2">{group.size} participants</Badge>
                    {group.childCount && group.childCount > 0 && (
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                        {group.childCount} {group.childCount === 1 ? 'child' : 'children'}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Entry time: {group.entryTime}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleGroupAction(index, 'edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleGroupAction(index, 'assignGuide')}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center">
                <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                <span className="text-sm font-medium">Guide:</span>
                {guideInfo ? (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                    {guideName} ({guideInfo.guideType})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                    Unassigned
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Modify group details and assignment.
            </DialogDescription>
          </DialogHeader>
          {selectedGroupIndex !== null && (
            <EditGroupForm 
              tourId={tour.id}
              group={tour.tourGroups[selectedGroupIndex]}
              groupIndex={selectedGroupIndex}
              onSuccess={() => setIsEditGroupOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAssignGuideOpen} onOpenChange={setIsAssignGuideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Guide</DialogTitle>
            <DialogDescription>
              Choose a guide to assign to this group.
            </DialogDescription>
          </DialogHeader>
          {selectedGroupIndex !== null && (
            <AssignGuideForm 
              tourId={tour.id}
              groupIndex={selectedGroupIndex}
              guides={[
                // Make sure all guides have valid IDs
                { 
                  id: guide1Info?.id || "guide1", 
                  name: tour.guide1, 
                  info: guide1Info 
                },
                ...(tour.guide2 ? [{ 
                  id: guide2Info?.id || "guide2", 
                  name: tour.guide2, 
                  info: guide2Info 
                }] : []),
                ...(tour.guide3 ? [{ 
                  id: guide3Info?.id || "guide3", 
                  name: tour.guide3, 
                  info: guide3Info 
                }] : [])
              ].filter(guide => guide.id && guide.id.trim() !== "")}
              currentGuideId={tour.tourGroups[selectedGroupIndex].guideId}
              onSuccess={() => setIsAssignGuideOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

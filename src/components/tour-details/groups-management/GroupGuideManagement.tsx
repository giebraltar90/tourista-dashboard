
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  UserPlus, 
  Users, 
  Edit, 
  AlertTriangle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { AddGroupForm } from "./AddGroupForm";
import { EditGroupForm } from "./EditGroupForm";
import { AssignGuideForm } from "./AssignGuideForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo } from "@/hooks/useGuideData";
import { useUpdateTourCapacity } from "@/hooks/useTourCapacity";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { GroupCapacityAlert } from "./GroupCapacityAlert";

interface GroupGuideManagementProps {
  tour: TourCardProps;
}

export const GroupGuideManagement = ({ tour }: GroupGuideManagementProps) => {
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  
  const guide1Info = useGuideInfo(tour.guide1);
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  
  const { updateTourCapacity, isUpdating } = useUpdateTourCapacity(tour.id);
  
  const isHighSeason = tour.isHighSeason ?? false;
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  const capacity = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeason : 
    totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard ? 
      DEFAULT_CAPACITY_SETTINGS.exception : 
      DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeasonGroups : 
    DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  const handleGroupAction = (index: number, action: 'edit' | 'assignGuide') => {
    setSelectedGroupIndex(index);
    if (action === 'edit') {
      setIsEditGroupOpen(true);
    } else {
      setIsAssignGuideOpen(true);
    }
  };

  const handleToggleHighSeason = async () => {
    // Update the tour's high season flag
    await updateTourCapacity({
      ...tour,
      isHighSeason: !isHighSeason,
    });
  };

  // Helper to get guide name for display
  const getGuideNameAndInfo = (guideId?: string) => {
    if (!guideId) return { name: "Unassigned", info: null };
    
    if (guide1Info?.id === guideId) {
      return { name: tour.guide1, info: guide1Info };
    } else if (guide2Info?.id === guideId) {
      return { name: tour.guide2 || "", info: guide2Info };
    } else if (guide3Info?.id === guideId) {
      return { name: tour.guide3 || "", info: guide3Info };
    }
    
    return { name: "Unassigned", info: null };
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Group & Guide Management</CardTitle>
            <CardDescription>Manage groups and assign guides to them</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant={isHighSeason ? "default" : "outline"}
            onClick={handleToggleHighSeason}
            disabled={isUpdating}
          >
            {isHighSeason ? "High Season Mode" : "Standard Mode"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Current Capacity</h3>
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md">
                <div>
                  <p className="text-sm font-medium">Participants</p>
                  <p className="text-2xl">{totalParticipants} / {capacity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Groups</p>
                  <p className="text-2xl">{tour.tourGroups.length} / {requiredGroups}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Booking Rules</h3>
              <div className="text-sm p-4 bg-muted/30 rounded-md space-y-1">
                <p><strong>Standard:</strong> 24 bookings (2 groups)</p>
                <p><strong>Exception:</strong> Up to 29 bookings (2 groups)</p>
                <p><strong>High Season:</strong> 36 bookings (3 groups)</p>
              </div>
            </div>
          </div>
          
          {/* Add the new GroupCapacityAlert component */}
          <GroupCapacityAlert 
            tourGroups={tour.tourGroups} 
            isHighSeason={isHighSeason} 
          />
          
          {tour.tourGroups.length < requiredGroups && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isHighSeason
                  ? `High season requires ${requiredGroups} groups, but you only have ${tour.tourGroups.length}. Please add more groups.`
                  : `Standard capacity requires ${requiredGroups} groups, but you only have ${tour.tourGroups.length}. Please add more groups.`
                }
              </AlertDescription>
            </Alert>
          )}
          
          <Separator />
          
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
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <div className="text-sm text-muted-foreground">
          Groups should be balanced and guides assigned based on capacity requirements.
        </div>
      </CardFooter>
      
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
                { id: guide1Info?.id || "guide1", name: tour.guide1, info: guide1Info },
                ...(tour.guide2 ? [{ id: guide2Info?.id || "guide2", name: tour.guide2, info: guide2Info }] : []),
                ...(tour.guide3 ? [{ id: guide3Info?.id || "guide3", name: tour.guide3, info: guide3Info }] : [])
              ]}
              currentGuideId={tour.tourGroups[selectedGroupIndex].guideId}
              onSuccess={() => setIsAssignGuideOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

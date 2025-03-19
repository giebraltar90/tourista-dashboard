
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsTable } from "./GroupsTable";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";

interface GroupsManagementProps {
  tour: TourCardProps;
}

export const GroupsManagement = ({ tour }: GroupsManagementProps) => {
  const {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setSelectedParticipant,
    isMovePending
  } = useGroupManagement(tour);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Management</CardTitle>
        <CardDescription>Details of participant groups and their assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <GroupsTable 
            tourGroups={localTourGroups} 
            tour={tour} 
          />
          
          <Separator className="my-4" />
          
          <GroupsGrid
            tourGroups={localTourGroups}
            tour={tour}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onMoveClick={setSelectedParticipant}
            selectedParticipant={selectedParticipant}
            handleMoveParticipant={handleMoveParticipant}
            isMovePending={isMovePending}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Group division is based on families or couples + singles and further divided into adults + children.
        </div>
        <Button 
          variant="outline" 
          size="sm"
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Edit Groups
        </Button>
      </CardFooter>
    </Card>
  );
};

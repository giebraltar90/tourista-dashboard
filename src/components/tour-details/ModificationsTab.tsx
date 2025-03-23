
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddModificationDialog } from "./modifications";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useModifications } from "@/hooks/modifications/useModifications";

export interface ModificationsTabProps {
  tour: TourCardProps;
  tourId: string;
}

export const ModificationsTab = ({ tour, tourId }: ModificationsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { modifications, addModification, isAddingModification } = useModifications(tourId);
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tour Modifications</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleOpenDialog}
          >
            <PlusCircle className="h-4 w-4" />
            Add Modification
          </Button>
        </CardHeader>
        <CardContent>
          {isAddingModification ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : modifications && modifications.length > 0 ? (
            <div className="space-y-4">
              {modifications.map((mod) => (
                <div key={mod.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{mod.status || "Modified"}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(mod.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{mod.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              No modifications have been made to this tour yet.
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddModificationDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        tourId={tourId}
      />
    </>
  );
};


import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2, Clock } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useModifications } from "@/hooks/useModifications";
import { AddModificationDialog } from "./modifications/AddModificationDialog";
import { useState, useEffect } from "react";
import { useRestoreTour } from "@/hooks/useRestoreTour";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModificationsTabProps {
  tour: TourCardProps;
}

export const ModificationsTab = ({ tour }: ModificationsTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const { modifications, addModification } = useModifications(tour.id);
  const { restoreToInitial } = useRestoreTour(tour.id);
  
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;

  const handleRestore = async () => {
    setIsRestoreDialogOpen(false);
    await restoreToInitial();
  };
  
  // For debugging - log modifications on mount and whenever they change
  useEffect(() => {
    console.log("Modifications in ModificationsTab:", modifications);
  }, [modifications]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tour Modifications</CardTitle>
          <CardDescription>View and manage all changes made to this tour</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add Note
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsRestoreDialogOpen(true)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore Initial Version
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium">Special Instructions</h3>
            <p className="mt-2 text-muted-foreground">
              Group division: Split into families or couples + singles. Further divided into adults + children.
            </p>
            <p className="mt-2 text-muted-foreground">
              Adults: {adultTickets}, Children: {childTickets}
            </p>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Modification</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modifications && modifications.length > 0 ? (
                modifications.map((mod) => (
                  <TableRow key={mod.id}>
                    <TableCell>{format(new Date(mod.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{mod.user}</TableCell>
                    <TableCell>{mod.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {mod.status === "complete" ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                            <span>Complete</span>
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4 text-amber-500" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No modifications recorded yet
                  </TableCell>
                </TableRow>
              )}
              
              <TableRow>
                <TableCell>{format(new Date(), 'MMM d, yyyy')}</TableCell>
                <TableCell>System</TableCell>
                <TableCell>Tour created</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    <span>Complete</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Restore confirmation dialog */}
      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Tour</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this tour to its initial state? This will reset all group assignments and guide allocations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Yes, Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AddModificationDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        tourId={tour.id}
      />
    </Card>
  );
};

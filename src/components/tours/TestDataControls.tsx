
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTestData } from "@/hooks/testData/useTestData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const TestDataControls = () => {
  const { createTestTours, clearTestData } = useTestData();
  const [isCreating, setIsCreating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  const handleCreateTestData = async () => {
    setIsCreating(true);
    await createTestTours();
    setIsCreating(false);
  };
  
  const handleClearTestData = async () => {
    setIsClearing(true);
    await clearTestData();
    setIsClearing(false);
  };
  
  return (
    <div className="flex gap-3 mt-4 justify-end">
      <Button 
        variant="outline" 
        onClick={handleCreateTestData}
        disabled={isCreating || isClearing}
      >
        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Test Data
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            disabled={isCreating || isClearing}
          >
            {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clear Test Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all test data from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearTestData}>
              Yes, Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

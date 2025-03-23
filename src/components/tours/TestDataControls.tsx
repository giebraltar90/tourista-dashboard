
import { Button } from "@/components/ui/button";
import { Loader2, Bug } from "lucide-react";
import { useTestData } from "@/hooks/testData/useTestData";
import { useDebugMode } from "@/contexts/DebugContext";
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
  const { createTestTours, clearTestData, isCreatingTestData, isClearingTestData } = useTestData();
  const debugMode = useDebugMode();
  
  return (
    <div className="flex flex-col gap-3 mt-4">
      {debugMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-amber-700 text-xs flex items-center mb-2">
          <Bug className="h-4 w-4 mr-2" />
          <span>Debug mode enabled - console logs active</span>
        </div>
      )}
      
      <div className="flex gap-3 justify-end">
        <Button 
          variant="outline" 
          onClick={createTestTours}
          disabled={isCreatingTestData || isClearingTestData}
        >
          {isCreatingTestData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Test Data
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={isCreatingTestData || isClearingTestData}
            >
              {isClearingTestData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <AlertDialogAction onClick={clearTestData}>
                Yes, Clear All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};


import { useState, useEffect } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatabaseStatus } from "./DatabaseStatus";
import { RefreshControls } from "./RefreshControls";
import { FormActions } from "./FormActions";
import { AssignGuideForm } from "./AssignGuideForm";
import { useDatabaseData } from "./hooks/useDatabaseData";

interface GroupAssignmentProps {
  tour: TourCardProps;
}

export const GroupAssignment = ({ tour }: GroupAssignmentProps) => {
  const [activeTab, setActiveTab] = useState("guides");
  const { dbCheckResult, isLoading, isRefreshing, handleRefresh } = useDatabaseData(tour.id);

  useEffect(() => {
    // Log the database check results
    if (dbCheckResult) {
      console.log("Database check results:", dbCheckResult);
    }
  }, [dbCheckResult]);

  return (
    <div className="space-y-4">
      <Card className="bg-muted/10">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-medium">Tour Group Assignment</h3>
            
            <DatabaseStatus dbCheckResult={dbCheckResult} />
            
            <RefreshControls 
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
            
            <Tabs defaultValue="guides" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="guides" className="flex-1">Guide Assignment</TabsTrigger>
                <TabsTrigger value="capacity" className="flex-1">Group Capacity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="guides" className="pt-4">
                <AssignGuideForm 
                  tour={tour}
                  onComplete={() => { handleRefresh(); }}
                />
              </TabsContent>
              
              <TabsContent value="capacity" className="pt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure capacity settings for each group in this tour.
                  </p>
                  
                  <FormActions>
                    <Button type="button" variant="outline" onClick={handleRefresh}>
                      Reset
                    </Button>
                    <Button type="button">
                      Update Capacity
                    </Button>
                  </FormActions>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

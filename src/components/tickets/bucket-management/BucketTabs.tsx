
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { CSVUploader } from "../CSVUploader";

interface BucketTabsProps {
  activeTab: string;
  onCreateNew: () => void;
}

export function BucketTabs({ activeTab, onCreateNew }: BucketTabsProps) {
  return (
    <>
      <TabsContent value="list" className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Ticket Buckets</h3>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bucket
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="upload">
        <CSVUploader />
      </TabsContent>
    </>
  );
}


import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

interface TourTabsProps {
  activeValue: string;
  onValueChange: (value: string) => void;
  tourId: string;
  guide1: string;
  guide2: string;
  guide3: string;
  groupCount: number;
  groupGuides: {
    name: string;
    guideId?: string;
  }[];
}

export const TourTabs = ({ 
  activeValue, 
  onValueChange,
  tourId,
  guide1,
  guide2,
  guide3,
  groupCount,
  groupGuides
}: TourTabsProps) => {
  // Debug log to trace data passing
  useEffect(() => {
    console.log("TourTabs received updated tour data:", {
      tourId,
      guide1,
      guide2,
      guide3,
      groupCount,
      groupGuides
    });
  }, [tourId, guide1, guide2, guide3, groupCount, groupGuides]);
  
  return (
    <Tabs value={activeValue} onValueChange={onValueChange} className="w-full">
      <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto p-1">
        <TabsTrigger 
          value="overview" 
          className="py-2 px-4 data-[state=active]:bg-background rounded-md"
        >
          Overview
        </TabsTrigger>
        
        <TabsTrigger 
          value="tickets" 
          className="py-2 px-4 data-[state=active]:bg-background rounded-md"
        >
          Tickets
        </TabsTrigger>
        
        <TabsTrigger 
          value="modifications" 
          className="py-2 px-4 data-[state=active]:bg-background rounded-md"
        >
          Modifications
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

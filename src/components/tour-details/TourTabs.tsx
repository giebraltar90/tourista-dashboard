
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TourTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TourTabs = ({ 
  activeTab, 
  onTabChange
}: TourTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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

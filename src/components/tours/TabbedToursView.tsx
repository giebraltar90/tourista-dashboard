
import React from "react";
import { TourCardProps } from "@/components/tours/TourCard";
import { UpcomingTours } from "@/components/dashboard/UpcomingTours";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabbedToursViewProps {
  tours: TourCardProps[];
}

export function TabbedToursView({ tours }: TabbedToursViewProps) {
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">Upcoming Tours</TabsTrigger>
        <TabsTrigger value="past">Past Tours</TabsTrigger>
        <TabsTrigger value="all">All Tours</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="mt-6">
        <UpcomingTours tours={tours} />
      </TabsContent>
      
      <TabsContent value="past" className="mt-6">
        <div className="text-center py-8 text-muted-foreground">
          Past tours will appear here
        </div>
      </TabsContent>
      
      <TabsContent value="all" className="mt-6">
        <UpcomingTours tours={tours} />
      </TabsContent>
    </Tabs>
  );
}

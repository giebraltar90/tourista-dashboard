
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TicketManagement } from "@/components/tickets/TicketManagement";
import { TicketRules } from "@/components/tickets/TicketRules";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Ticket, 
  FileText,
  Users
} from "lucide-react";

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage tickets for all tours, entry times, and special requirements
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tickets
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Ticket Overview</CardTitle>
            <CardDescription>
              Manage all tickets and entry times for Versailles and other tours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="versailles">Versailles</TabsTrigger>
                <TabsTrigger value="paris">Paris Tours</TabsTrigger>
                <TabsTrigger value="private">Private Tours</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <TicketManagement filterType="all" />
              </TabsContent>
              
              <TabsContent value="versailles" className="mt-6">
                <TicketManagement filterType="versailles" />
              </TabsContent>
              
              <TabsContent value="paris" className="mt-6">
                <TicketManagement filterType="paris" />
              </TabsContent>
              
              <TabsContent value="private" className="mt-6">
                <TicketManagement filterType="private" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <TicketRules />
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;

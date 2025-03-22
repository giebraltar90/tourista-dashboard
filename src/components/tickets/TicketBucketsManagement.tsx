
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketBucket } from "@/types/ticketBuckets";
import { fetchTicketBuckets, deleteTicketBucket } from "@/services/api/ticketBucketService";
import { toast } from "sonner";
import { format } from "date-fns";
import { EditTicketBucketDialog } from "@/components/tour-details/ticket-management/ticket-bucket/EditTicketBucketDialog";
import { 
  BucketFilters, 
  BucketList, 
  BucketTabs,
  CreateBucketPanel
} from "./bucket-management";

export function TicketBucketsManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [buckets, setBuckets] = useState<TicketBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bucketToEdit, setBucketToEdit] = useState<TicketBucket | null>(null);
  
  useEffect(() => {
    loadTicketBuckets();
  }, []);
  
  const loadTicketBuckets = async () => {
    setLoading(true);
    try {
      const data = await fetchTicketBuckets();
      setBuckets(data);
    } catch (error) {
      console.error("Failed to load ticket buckets:", error);
      toast.error("Failed to load ticket buckets");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteBucket = async (id: string) => {
    try {
      await deleteTicketBucket(id);
      setBuckets(buckets.filter(bucket => bucket.id !== id));
      toast.success("Ticket bucket deleted successfully");
    } catch (error) {
      console.error("Failed to delete ticket bucket:", error);
      toast.error("Failed to delete ticket bucket");
    }
  };
  
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    loadTicketBuckets();
    toast.success("Ticket bucket created successfully");
  };

  const handleBucketUpdated = () => {
    loadTicketBuckets();
    setBucketToEdit(null);
  };
  
  const filteredBuckets = buckets.filter(bucket => {
    const matchesSearch = 
      bucket.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bucket.access_time?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !selectedDate || 
      format(bucket.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    
    return matchesSearch && matchesDate;
  });
  
  const bucketsByDate = filteredBuckets.reduce((acc, bucket) => {
    const dateStr = format(bucket.date, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(bucket);
    return acc;
  }, {} as Record<string, TicketBucket[]>);
  
  const sortedDates = Object.keys(bucketsByDate).sort();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Buckets Management</CardTitle>
          <CardDescription>
            Manage ticket buckets for Versailles tours based on reference numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                <TabsTrigger value="list">Ticket Buckets</TabsTrigger>
                <TabsTrigger value="upload">CSV Upload</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeTab === "list" && (
                  <BucketFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                )}
              </div>
            </div>
            
            <BucketTabs 
              activeTab={activeTab} 
              onCreateNew={() => setIsCreateModalOpen(true)} 
            />
            
            {isCreateModalOpen && (
              <CreateBucketPanel
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            )}
            
            <TabsContent value="list">
              <BucketList
                bucketsByDate={bucketsByDate}
                sortedDates={sortedDates}
                loading={loading}
                onDelete={handleDeleteBucket}
                onEdit={setBucketToEdit}
                onCreateNew={() => setIsCreateModalOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {bucketToEdit && (
        <EditTicketBucketDialog
          isOpen={true}
          onClose={handleBucketUpdated}
          bucket={bucketToEdit}
        />
      )}
    </div>
  );
}

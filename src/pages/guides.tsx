
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { logger } from "@/utils/logger";

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchGuides() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('guides').select('*');
        
        if (error) {
          logger.error("Error fetching guides:", error);
          return;
        }
        
        logger.debug("Fetched guides:", data);
        setGuides(data || []);
      } catch (error) {
        logger.error("Unexpected error fetching guides:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGuides();
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tour Guides</h1>
          <Badge className="px-3 py-1 text-sm">{guides.length} Guides</Badge>
        </div>
        
        <Separator className="my-2" />
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide: any) => (
              <Card key={guide.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{guide.name}</CardTitle>
                  <Badge variant="outline">{guide.guide_type}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {guide.birthday && (
                      <p>Birthday: {new Date(guide.birthday).toLocaleDateString()}</p>
                    )}
                    <p>Created: {new Date(guide.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {guides.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No guides found. Add guides from the Tours management page.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

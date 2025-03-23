
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GuideInfo } from "@/types/ventrata";
import { useEffect, useState } from "react";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

interface GuideSelectFieldProps {
  form: any;
  guides: Array<{
    id: string;
    name: string;
    info: GuideInfo | null;
  }>;
  defaultValue: string;
}

export const GuideSelectField = ({ form, guides, defaultValue }: GuideSelectFieldProps) => {
  const [uniqueGuides, setUniqueGuides] = useState(guides);
  
  // Process guides when component mounts or guides change
  useEffect(() => {
    // Log input for debugging
    console.log("GuideSelectField rendering with:", {
      defaultValue,
      guidesCount: guides.length,
      guides: guides.map(g => ({ id: g.id, name: g.name }))
    });
    
    // Filter out invalid guides and ensure no duplicates
    const seen = new Set<string>();
    const processed = guides.filter(guide => {
      // Skip if missing required fields
      if (!guide || !guide.id || guide.id.trim() === "") return false;
      
      // Skip duplicates by ID or name
      const key = `${guide.id}-${guide.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      
      return true;
    }).map(guide => {
      // Clean up guide names
      if (!guide.name || guide.name.includes('...') || guide.name === guide.id) {
        return {
          ...guide,
          name: guide.info?.name || `Guide (ID: ${guide.id.substring(0, 8)})`
        };
      }
      return guide;
    });
    
    // Sort alphabetically by name
    processed.sort((a, b) => a.name.localeCompare(b.name));
    
    setUniqueGuides(processed);
  }, [guides, defaultValue]);
  
  return (
    <FormField
      control={form.control}
      name="guideId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Guide</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={defaultValue}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a guide" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="_none">None (Unassign Guide)</SelectItem>
              {uniqueGuides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  <div className="flex items-center gap-2">
                    <span>{guide.name}</span>
                    {guide.info?.guideType && (
                      <Badge variant="outline" className="text-xs">
                        {guide.info.guideType}
                      </Badge>
                    )}
                    {!isValidUuid(guide.id) && (
                      <Badge variant="destructive" className="text-xs">
                        Invalid ID
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

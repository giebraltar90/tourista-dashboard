
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";

interface GuideOption {
  id: string;
  name: string;
  info: GuideInfo | null;
}

interface GuideSelectFieldProps {
  form: UseFormReturn<any>;
  guides: GuideOption[];
  defaultValue: string;
}

export const GuideSelectField = ({ 
  form, 
  guides, 
  defaultValue 
}: GuideSelectFieldProps) => {
  const [processedGuides, setProcessedGuides] = useState<GuideOption[]>([]);
  
  useEffect(() => {
    // Log guides data to help with debugging
    console.log("GuideSelectField guides data:", guides);
    
    // Process guides to ensure all have readable names
    const processed = guides.map(guide => {
      // If guide has no name or UUID as name or name with "..." in it, try to give it a better name
      let displayName = guide.name;
      
      if (!displayName || displayName.includes('...') || displayName === guide.id) {
        // Try to get name from guide info
        if (guide.info?.name && guide.info.name.trim() !== '') {
          displayName = guide.info.name;
        } else {
          // Fallback to a formatted ID display
          displayName = `Guide (${guide.id.substring(0, 8)})`;
        }
      }
      
      return {
        ...guide,
        name: displayName
      };
    });
    
    // Filter out any guides with empty ids to avoid the Select.Item error
    const valid = processed.filter(guide => 
      guide && guide.id && guide.id.trim() !== "" && guide.name
    );
    
    // Log the processed guides
    console.log("GuideSelectField processed guides:", valid);
    
    setProcessedGuides(valid);
  }, [guides]);
  
  return (
    <FormField
      control={form.control}
      name="guideId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Guide</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value || defaultValue}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Choose a guide" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="_none">None (Unassigned)</SelectItem>
              {processedGuides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  <div className="flex items-center">
                    <span>{guide.name}</span>
                    {guide.info && guide.info.guideType && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {guide.info.guideType}
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


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
  
  // Helper function to check if a guide is Sophie Miller
  const isSophieMiller = (name: string): boolean => {
    return name.toLowerCase().includes('sophie miller');
  };
  
  useEffect(() => {
    // Log guides data to help with debugging
    console.log("🔍 [GuideSelectField] Received guides data:", guides.map(g => ({
      id: g.id,
      name: g.name, 
      info: g.info ? {
        name: g.info.name,
        guideType: g.info.guideType
      } : null
    })));
    
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
      
      // Special handling for Sophie Miller - always mark as GC
      if (guide.info && isSophieMiller(displayName)) {
        console.log("🔍 [GuideSelectField] Found Sophie Miller - ensuring GC type");
        guide.info.guideType = 'GC';
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
    console.log("🔍 [GuideSelectField] Processed guides:", valid.map(g => ({
      id: g.id,
      name: g.name,
      guideType: g.info?.guideType,
      isSophieMiller: isSophieMiller(g.name)
    })));
    
    setProcessedGuides(valid);
  }, [guides]);
  
  return (
    <FormField
      control={form.control}
      name="guideId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Guide</FormLabel>
          <Select 
            onValueChange={(value) => {
              console.log("🔍 [GuideSelectField] Selected guide:", value);
              field.onChange(value);
            }} 
            defaultValue={field.value || defaultValue}
          >
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
                      <Badge 
                        variant="outline" 
                        className={`ml-2 text-xs ${
                          isSophieMiller(guide.name) 
                            ? "bg-purple-50 text-purple-800 border-purple-300" 
                            : guide.info.guideType === 'GA Ticket'
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : guide.info.guideType === 'GA Free'
                                ? "bg-green-50 text-green-800 border-green-300"
                                : "bg-gray-50 text-gray-800 border-gray-300"
                        }`}
                      >
                        {isSophieMiller(guide.name) ? 'GC' : guide.info.guideType}
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

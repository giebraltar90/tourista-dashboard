
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
  // Process guides to ensure all have readable names
  const processedGuides = guides.map(guide => {
    // If guide has a UUID as name or name with "..." in it, try to give it a better name
    if (!guide.name || guide.name.includes('...') || guide.name === guide.id) {
      return {
        ...guide,
        name: guide.info?.name || `Guide (ID: ${guide.id.substring(0, 8)})`
      };
    }
    return guide;
  });
  
  // Filter out any guides with empty ids to avoid the Select.Item error
  const validGuides = processedGuides.filter(guide => 
    guide && guide.id && guide.id.trim() !== "" && guide.name
  );
  
  // Log the guides for debugging
  console.log("GUIDE SELECTION DEBUG: Available guides for selection:", 
    validGuides.map(g => ({id: g.id, name: g.name, infoName: g.info?.name}))
  );
  
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
              {validGuides.map((guide) => (
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

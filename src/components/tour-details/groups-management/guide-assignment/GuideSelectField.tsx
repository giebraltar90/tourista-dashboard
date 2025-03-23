
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
import { GuideOption } from "@/hooks/group-management/types";
import { UseFormReturn } from "react-hook-form";

interface GuideSelectFieldProps {
  form: UseFormReturn<any>;
  guides: GuideOption[];
  defaultValue: string;
}

export const GuideSelectField = ({ form, guides, defaultValue }: GuideSelectFieldProps) => {
  // Ensure all guides have readable names
  const processedGuides = guides.map(guide => {
    // If guide has a UUID as name or name with "..." in it, try to give it a better name
    if (!guide.name || guide.name.includes('...')) {
      return {
        ...guide,
        name: guide.info?.name || `Guide (ID: ${guide.id.substring(0, 8)})`
      };
    }
    return guide;
  });
  
  // Filter out any invalid guides
  const validGuides = processedGuides.filter(guide => 
    guide && guide.id && guide.id.trim() !== ""
  );
  
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
              {validGuides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  <div className="flex items-center gap-2">
                    <span>{guide.name}</span>
                    {guide.info?.guideType && (
                      <Badge variant="outline" className="text-xs">
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


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
  
  console.log("🔍 [GuideSelectField] Rendering with guides:", validGuides.map(g => ({
    id: g.id,
    name: g.name,
    guideType: g.info?.guideType
  })));
  
  return (
    <FormField
      control={form.control}
      name="guideId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Guide</FormLabel>
          <Select 
            onValueChange={(value) => {
              console.log(`🔍 [GuideSelectField] Selected guide: ${value}`);
              field.onChange(value);
            }} 
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
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
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

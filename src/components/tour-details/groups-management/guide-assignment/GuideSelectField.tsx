
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
  // Make sure we have a value - defaulting to "_none" if undefined or null
  const safeDefaultValue = defaultValue || "_none";
  
  // Fix any guides with missing name
  const processedGuides = guides.map(guide => {
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
  
  console.log("GuideSelectField rendering with:", {
    defaultValue: safeDefaultValue,
    guidesCount: validGuides.length,
    guides: validGuides.map(g => ({ id: g.id, name: g.name }))
  });
  
  return (
    <FormField
      control={form.control}
      name="guideId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Guide</FormLabel>
          <Select 
            onValueChange={(value) => {
              console.log(`Selected guide ID: ${value}`);
              field.onChange(value);
            }} 
            defaultValue={safeDefaultValue}
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

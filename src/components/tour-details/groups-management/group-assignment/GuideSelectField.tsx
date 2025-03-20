
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
              {guides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  {guide.name}
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

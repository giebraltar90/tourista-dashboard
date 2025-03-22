
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BucketTypeFieldProps {
  selectedType: 'petit' | 'grande';
  onTypeChange: (value: 'petit' | 'grande') => void;
}

export function BucketTypeField({ selectedType, onTypeChange }: BucketTypeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Bucket Type</Label>
      <Select 
        value={selectedType} 
        onValueChange={(value) => onTypeChange(value as 'petit' | 'grande')}
      >
        <SelectTrigger id="type">
          <SelectValue placeholder="Select bucket type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="petit">Petit (3-10)</SelectItem>
          <SelectItem value="grande">Grande (11-30)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

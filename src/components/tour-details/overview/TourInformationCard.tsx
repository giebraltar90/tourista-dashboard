
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TourInformationCardProps {
  referenceCode: string;
  tourType: string;
}

export const TourInformationCard = ({ referenceCode, tourType }: TourInformationCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tour Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference:</span>
            <span className="font-medium">#{referenceCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className={
              tourType === 'food' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              tourType === 'private' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
              'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }>
              {tourType === 'food' ? 'Food Tour' : 
                tourType === 'private' ? 'Private Tour' : 
                'Standard Tour'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
              Confirmed
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

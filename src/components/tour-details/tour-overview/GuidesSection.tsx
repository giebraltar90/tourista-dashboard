
import { GuideInfo } from "@/types/ventrata";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GuidesSectionProps {
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const GuidesSection = ({ guide1Info, guide2Info, guide3Info }: GuidesSectionProps) => {
  const hasAnyGuide = guide1Info || guide2Info || guide3Info;
  
  if (!hasAnyGuide) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">No guides have been assigned to this tour yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {guide1Info && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Guide 1</h3>
            <p className="font-semibold">{guide1Info.name}</p>
            <Badge variant="outline" className="mt-2">
              {guide1Info.guideType}
            </Badge>
          </CardContent>
        </Card>
      )}
      
      {guide2Info && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Guide 2</h3>
            <p className="font-semibold">{guide2Info.name}</p>
            <Badge variant="outline" className="mt-2">
              {guide2Info.guideType}
            </Badge>
          </CardContent>
        </Card>
      )}
      
      {guide3Info && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Guide 3</h3>
            <p className="font-semibold">{guide3Info.name}</p>
            <Badge variant="outline" className="mt-2">
              {guide3Info.guideType}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

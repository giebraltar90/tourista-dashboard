
import { GuideInfo } from "@/types/ventrata";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GuidesSectionProps {
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const GuidesSection = ({ guide1Info, guide2Info, guide3Info }: GuidesSectionProps) => {
  const guides = [
    { info: guide1Info, label: "Primary Guide" },
    { info: guide2Info, label: "Secondary Guide" },
    { info: guide3Info, label: "Third Guide" }
  ].filter(guide => guide.info);
  
  if (guides.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">No guides assigned to this tour.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {guides.map((guide, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">{guide.label}</h3>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{guide.info?.name || "Unnamed Guide"}</p>
              <Badge variant="outline" className="w-fit">{guide.info?.guideType || "GA Ticket"}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRole } from "@/contexts/RoleContext";
import { User, ChevronDown, LogOut } from "lucide-react";
import { useTours } from "@/hooks/useTourData";
import { toast } from "sonner";

export function RoleSwitcher() {
  const { role, setRole, guideView, setGuideView } = useRole();
  const [open, setOpen] = useState(false);
  const { data: tours } = useTours();
  
  // Extract unique guide names from tours
  const uniqueGuides = tours
    ? Array.from(
        new Set(
          tours.flatMap(tour => 
            [tour.guide1, tour.guide2].filter(Boolean) as string[]
          )
        )
      )
    : [];

  const handleGuideView = (guideName: string) => {
    toast.success(`Now viewing as guide: ${guideName}`);
    setGuideView({ type: "guide", guideName });
    setOpen(false);
  };

  const exitGuideView = () => {
    setGuideView(null);
    toast.info("Exited guide view");
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-40">
          <User className="h-4 w-4" />
          {guideView ? (
            <span className="text-orange-500 font-medium">
              Viewing as: {guideView.guideName}
            </span>
          ) : (
            <span>Tour Operator</span>
          )}
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {guideView ? (
          <DropdownMenuItem onClick={exitGuideView}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Exit Guide View</span>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
              Guide Views
            </DropdownMenuLabel>
            {uniqueGuides.map((guide) => (
              <DropdownMenuItem 
                key={guide} 
                onClick={() => handleGuideView(guide)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{guide}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

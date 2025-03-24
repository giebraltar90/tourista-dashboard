
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RoleSwitcher } from "./RoleSwitcher";
import { useRole } from "@/contexts/RoleContext";
import { Sidebar } from "./Sidebar";
import { ModeToggle } from "@/components/theme/ModeToggle";

interface TopBarProps {
  title?: string;
}

export const TopBar = ({ title = "Tour Management" }: TopBarProps) => {
  const { role, guideName } = useRole();

  // Adjust title based on user role
  const displayTitle = role === "guide" && guideName
    ? `Guide Dashboard - ${guideName}`
    : role === "admin" 
      ? "Admin Dashboard" 
      : title;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* Mobile menu button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <SheetHeader className="px-1">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigation and quick actions
              </SheetDescription>
            </SheetHeader>
            <Sidebar className="px-1" />
          </SheetContent>
        </Sheet>

        {/* Title */}
        <div className="font-bold text-xl">{displayTitle}</div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-2">
          <ModeToggle />
          <RoleSwitcher />
        </div>
      </div>
    </div>
  );
};

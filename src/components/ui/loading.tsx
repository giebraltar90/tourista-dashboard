
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loading = ({ size = "md", text }: LoadingProps) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {text && <p className="text-muted-foreground mt-2">{text}</p>}
    </div>
  );
};

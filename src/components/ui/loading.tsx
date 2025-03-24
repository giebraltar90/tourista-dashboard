
import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = "md", 
  text = "Loading..." 
}) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClass}`}></div>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
};

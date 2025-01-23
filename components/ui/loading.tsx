import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

export function Loading({ 
  className,
  size = "md",
  fullScreen = false,
  text
}: LoadingProps) {
  const sizes = {
    sm: 20,
    md: 24,
    lg: 32
  };

  const Container = fullScreen ? "div" : "span";
  
  return (
    <Container 
      className={cn(
        "flex items-center justify-center gap-2",
        fullScreen && "fixed inset-0 bg-background/10 backdrop-blur-sm z-50",
        className
      )}
    >
      <LoadingSpinner size={sizes[size]} />
      {text && (
        <span className="text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </Container>
  );
}
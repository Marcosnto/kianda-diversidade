import { cn } from "@workspace/ui/lib/utils";

export function TypographyLarge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-lg lg:text-2xl font-semibold", className)}>
      {children}
    </div>
  );
}

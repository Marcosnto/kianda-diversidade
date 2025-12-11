import { cn } from "@workspace/ui/lib/utils";

export default function Section({
  id,
  className,
  children,
  mobilePadding = "px-4",
}: {
  id?: string;
  className?: string;
  mobilePadding?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="">
      <div className={cn("", className, mobilePadding)}>{children}</div>
    </section>
  );
}

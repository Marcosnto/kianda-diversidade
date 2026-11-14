import { Skeleton } from "@workspace/ui/components/skeleton";

const ROW_SLOTS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export default function PanelAdminLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full sm:max-w-sm" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="rounded-md border">
        <div className="border-b p-4">
          <Skeleton className="h-4 w-full" />
        </div>
        {ROW_SLOTS.map((slot) => (
          <div className="border-b p-4 last:border-b-0" key={slot}>
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

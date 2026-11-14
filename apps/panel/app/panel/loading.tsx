import { Skeleton } from "@workspace/ui/components/skeleton";

const CARD_SLOTS = ["a", "b", "c", "d", "e", "f"] as const;

export default function PanelLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_SLOTS.map((slot) => (
          <Skeleton className="h-28 w-full rounded-lg" key={slot} />
        ))}
      </div>
    </div>
  );
}

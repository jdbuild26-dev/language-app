import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-[#dce8eb] dark:bg-[#2a383e]", className)}
      {...props}
    />
  );
}

export { Skeleton };


import { Badge } from "@/components/ui/badge";
import { type Quote } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: Quote['status'];
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles: Record<Quote['status'], string> = {
    draft: "bg-gray-200 text-gray-800 hover:bg-gray-200/80 dark:bg-gray-700 dark:text-gray-200",
    sent: "bg-blue-200 text-blue-800 hover:bg-blue-200/80 dark:bg-blue-800 dark:text-blue-100",
    accepted: "bg-green-200 text-green-800 hover:bg-green-200/80 dark:bg-green-800 dark:text-green-100",
    declined: "bg-orange-200 text-orange-800 hover:bg-orange-200/80 dark:bg-orange-800 dark:text-orange-100",
  };

  return (
    <Badge className={cn("capitalize border-transparent", statusStyles[status])}>
      {status}
    </Badge>
  );
}

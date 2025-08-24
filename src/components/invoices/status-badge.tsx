import { Badge } from "@/components/ui/badge";
import { type Invoice } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: Invoice['status'];
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles: Record<Invoice['status'], string> = {
    draft: "bg-gray-200 text-gray-800 hover:bg-gray-200/80 dark:bg-gray-700 dark:text-gray-200",
    sent: "bg-blue-200 text-blue-800 hover:bg-blue-200/80 dark:bg-blue-800 dark:text-blue-100",
    paid: "bg-green-200 text-green-800 hover:bg-green-200/80 dark:bg-green-800 dark:text-green-100",
    void: "bg-red-200 text-red-800 hover:bg-red-200/80 dark:bg-red-800 dark:text-red-100",
  };

  return (
    <Badge className={cn("capitalize border-transparent", statusStyles[status])}>
      {status}
    </Badge>
  );
}

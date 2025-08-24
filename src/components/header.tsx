import Link from "next/link";
import { UserNav } from "./auth/user-nav";
import { FileText } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">InvoiceFlow</span>
        </Link>
        <div className="flex flex-1 items-center justify-end">
          <UserNav />
        </div>
      </div>
    </header>
  );
}

import { UserNav } from "./auth/user-nav";
import Link from 'next/link';
import { FileText } from 'lucide-react';
import TopNav from './top-nav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
           <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
           </Link>
           <TopNav />
        </div>
        <div className="flex items-center gap-4">
            <UserNav />
        </div>
      </div>
    </header>
  );
}

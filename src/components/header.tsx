
import { UserNav } from "./auth/user-nav";
import Link from 'next/link';
import { FileText } from 'lucide-react';
import TopNav from './top-nav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 hidden md:flex items-center gap-2">
           <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
           </Link>
        </div>

        <div className="flex flex-1 items-center justify-between">
            <TopNav />
            <div className="flex items-center gap-4">
                <UserNav />
            </div>
        </div>
      </div>
    </header>
  );
}

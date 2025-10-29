
'use client';

import Link from 'next/link';
import { Workflow } from 'lucide-react';
import { UserNav } from './auth/user-nav';
import TopNav from './top-nav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* bar */}
        <div className="flex h-14 items-center justify-between gap-4">
          {/* brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/90 text-primary-foreground">
              <Workflow className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">CoreOps</span>
          </Link>

          {/* nav grows but never overflows brand + user */}
          <nav className="flex-1 min-w-0">
            <TopNav />
          </nav>

          {/* user */}
          <div className="shrink-0">
            <UserNav />
          </div>
        </div>

        {/* mobile scroll nav (optional if TopNav handles mobile) */}
        {/* <div className="md:hidden -mb-px overflow-x-auto pb-2">
          <TopNav mobile />
        </div> */}
      </div>
    </header>
  );
}

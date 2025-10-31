'use client';

import Link from 'next/link';
import { Workflow, Settings } from 'lucide-react';
import { UserNav } from './auth/user-nav';
import TopNav from './top-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/90 text-primary-foreground">
              <Workflow className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">CoreOps</span>
          </Link>

          {/* nav grows but never overflows brand + user */}
          <nav className="flex-1 min-w-0">
            <TopNav />
          </nav>

          {/* user */}
          <div className="flex items-center gap-2 shrink-0 pr-2 sm:pr-0">
            <UserNav />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

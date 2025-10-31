
'use client';

import Link from 'next/link';
import { Workflow, Settings, LogOut } from 'lucide-react';
import { UserNav } from './auth/user-nav';
import TopNav from './top-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from './ui/navigation-menu';
import { useAuth } from '@/context/auth-context';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase-client';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/90 text-primary-foreground">
                <Workflow className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold tracking-tight">CoreOps</span>
            </Link>
            <TopNav />
          </div>

          <div className="flex items-center gap-2 shrink-0">
             <NavigationMenu>
                <NavigationMenuList>
                    <TopNav include={['create', 'import', 'help']} />
                </NavigationMenuList>
            </NavigationMenu>
            <UserNav />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold">Heartland</p>
                            <p className="text-sm font-normal text-muted-foreground">{user?.displayName || user?.email}</p>
                        </div>
                    </div>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings">Application settings</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings">My profile</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem className="cursor-pointer">Join Referral Program</DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

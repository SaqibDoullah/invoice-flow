
'use client';

import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { getFirebaseAuth } from '@/lib/firebase-client';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserNav() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (nameOrEmail: string | null | undefined): string => {
    if (!nameOrEmail) return '';
    
    // If it's a name with spaces
    if (nameOrEmail.includes(' ')) {
      const parts = nameOrEmail.split(' ').filter(p => p.length > 0);
      if (parts.length > 1) {
        return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
      }
      if (parts.length === 1) {
          return parts[0].substring(0, 2).toUpperCase();
      }
    }
    
    // If it's an email or single name
    const emailPrefix = nameOrEmail.split('@')[0];
    const nameParts = emailPrefix.replace(/[^a-zA-Z\\s]/g, ' ').split(' ');
    
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    
    return emailPrefix.substring(0, 2).toUpperCase();
  };


  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
             <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(user.displayName || user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'My Account'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem asChild className="cursor-pointer">
             <Link href="/settings">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>My profile</span>
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { UserNav } from "./auth/user-nav";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          {/* We can add a logo or breadcrumbs here if needed */}
        </div>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 items-center justify-end">
          <UserNav />
        </div>
      </div>
    </header>
  );
}


'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Analytics', href: '/analytics' },
  { label: 'Purchasing', href: '/purchases' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Accounting', href: '/accounting' },
  { label: 'Selling', href: '/sales' },
  { label: 'Reports', href: '/reports' },
  { label: 'Barcoding', href: '/barcoding' },
  { label: 'Integrations', href: '/integrations' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center justify-center gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active}
            className="relative rounded-lg px-3 py-2 text-sm font-medium text-foreground/80
                       hover:bg-muted/60 transition
                       data-[active=true]:text-primary data-[active=true]:font-semibold"
          >
            {item.label}
            <span
              data-active={active}
              className="pointer-events-none absolute inset-x-2 -bottom-[9px] hidden h-0.5 rounded bg-primary
                         data-[active=true]:block"
            />
          </Link>
        );
      })}
    </div>
  );
}

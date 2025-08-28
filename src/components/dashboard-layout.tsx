'use client';

import DashboardSidebar from './dashboard-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardSidebar />
      {children}
    </>
  );
}

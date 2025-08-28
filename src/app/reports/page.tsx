'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { subMonths, format, isAfter } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import Header from '@/components/header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase-client';
import { type Invoice } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

interface MonthlyRevenue {
  name: string;
  revenue: number;
}

interface InvoiceStatusData {
  name: Invoice['status'];
  value: number;
}

interface ReportData {
  totalRevenue: number;
  paidInvoices: number;
  outstanding: number;
  overdue: number;
  monthlyRevenue: MonthlyRevenue[];
  invoiceStatus: InvoiceStatusData[];
}

const COLORS = {
    'paid': 'hsl(var(--chart-2))',
    'sent': 'hsl(var(--chart-1))',
    'draft': 'hsl(var(--chart-5))',
    'void': 'hsl(var(--destructive))',
};

const initialReportData: ReportData = {
    totalRevenue: 0,
    paidInvoices: 0,
    outstanding: 0,
    overdue: 0,
    monthlyRevenue: [],
    invoiceStatus: [],
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>(initialReportData);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const q = query(collection(db, 'users', user.uid, 'invoices'));
        const querySnapshot = await getDocs(q);
        const invoices = querySnapshot.docs.map(doc => doc.data() as Invoice);
        
        const now = new Date();
        const totalRevenue = invoices
          .filter(inv => inv.status === 'paid')
          .reduce((acc, inv) => acc + inv.total, 0);
        
        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
        
        const outstanding = invoices
          .filter(inv => inv.status === 'sent' && inv.dueDate && !isAfter(now, inv.dueDate.toDate()))
          .reduce((acc, inv) => acc + inv.total, 0);

        const overdue = invoices
          .filter(inv => inv.status === 'sent' && inv.dueDate && isAfter(now, inv.dueDate.toDate()))
          .reduce((acc, inv) => acc + inv.total, 0);

        const last6Months = Array.from({ length: 6 }, (_, i) => subMonths(now, i));
        const monthlyRevenueData = last6Months.map(month => {
            const monthStr = format(month, 'MMM');
            const revenue = invoices
                .filter(inv => inv.status === 'paid' && inv.invoiceDate && format(inv.invoiceDate.toDate(), 'yyyy-MM') === format(month, 'yyyy-MM'))
                .reduce((acc, inv) => acc + inv.total, 0);
            return { name: monthStr, revenue };
        }).reverse();
        
        const invoiceStatusData = (['paid', 'sent', 'draft', 'void'] as const).map(status => ({
            name: status,
            value: invoices.filter(inv => inv.status === status).length,
        }));

        setReportData({
          totalRevenue,
          paidInvoices,
          outstanding,
          overdue,
          monthlyRevenue: monthlyRevenueData,
          invoiceStatus: invoiceStatusData,
        });

      } catch (error) {
        console.error("Error fetching report data: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchReportData();
    }
  }, [user, authLoading]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const renderSummaryCard = (title: string, value: string | number, description: string, valueClass?: string, isLoading?: boolean) => (
      <Card>
          <CardHeader>
              <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </>
              ) : (
                <>
                  <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </>
              )}
          </CardContent>
      </Card>
  );

  return (
    <AuthGuard>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {renderSummaryCard('Total Revenue', formatCurrency(reportData.totalRevenue), 'All-time paid invoices', '', loading || authLoading)}
                {renderSummaryCard('Invoices Paid', reportData.paidInvoices, 'Total invoices marked as paid', '', loading || authLoading)}
                {renderSummaryCard('Outstanding', formatCurrency(reportData.outstanding), 'Invoices sent but not overdue', '', loading || authLoading)}
                {renderSummaryCard('Overdue', formatCurrency(reportData.overdue), 'Invoices past their due date', 'text-destructive', loading || authLoading)}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading || authLoading ? <Skeleton className="w-full h-[300px]" /> : (
                          <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={reportData.monthlyRevenue}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                                  <Tooltip 
                                      contentStyle={{
                                          background: 'hsl(var(--background))',
                                          border: '1px solid hsl(var(--border))'
                                      }}
                                      formatter={(value: number) => formatCurrency(value)}
                                  />
                                  <Legend />
                                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                              </BarChart>
                          </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loading || authLoading ? <Skeleton className="w-full h-[300px]" /> : (
                           <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                  <Pie
                                      data={reportData.invoiceStatus}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      outerRadius={100}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label={({ name, percent, value }) => value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                  >
                                      {reportData.invoiceStatus.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                      ))}
                                  </Pie>
                                  <Tooltip 
                                       contentStyle={{
                                          background: 'hsl(var(--background))',
                                          border: '1px solid hsl(var(--border))'
                                      }}
                                  />
                                  <Legend />
                              </PieChart>
                          </ResponsiveContainer>
                         )}
                    </CardContent>
                </Card>
            </div>

          </main>
        </div>
      </SidebarInset>
    </AuthGuard>
  );
}

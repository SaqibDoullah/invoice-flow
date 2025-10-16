'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { subMonths, format, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts';

import AuthGuard from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type Invoice } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ReportData {
  totalRevenue: number;
  paidInvoices: number;
  outstanding: number;
  overdue: number;
}

interface MonthlyRevenue {
    name: string;
    revenue: number;
}

interface InvoiceStatusDistribution {
    name: string;
    value: number;
    fill: string;
}

const initialReportData: ReportData = {
    totalRevenue: 0,
    paidInvoices: 0,
    outstanding: 0,
    overdue: 0,
};

const PIE_CHART_COLORS = {
    draft: 'hsl(var(--chart-1))',
    sent: 'hsl(var(--chart-2))',
    paid: 'hsl(var(--chart-3))',
    void: 'hsl(var(--chart-4))',
};

export default function ReportsPageContent() {
  const [reportData, setReportData] = useState<ReportData>(initialReportData);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<InvoiceStatusDistribution[]>([]);

  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchReportData = async () => {
      const db = getFirestoreDb();
      if (!user || !db) {
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

        setReportData({
          totalRevenue,
          paidInvoices,
          outstanding,
          overdue,
        });

        // Process data for charts
        const last6MonthsRevenue = Array.from({ length: 6 }).map((_, i) => {
            const date = subMonths(now, 5 - i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            
            const revenue = invoices
                .filter(inv => inv.status === 'paid' && inv.invoiceDate.toDate() >= monthStart && inv.invoiceDate.toDate() <= monthEnd)
                .reduce((acc, inv) => acc + inv.total, 0);

            return {
                name: format(date, 'MMM'),
                revenue: revenue
            };
        });
        setMonthlyRevenue(last6MonthsRevenue);

        const statusCounts = invoices.reduce((acc, inv) => {
            acc[inv.status] = (acc[inv.status] || 0) + 1;
            return acc;
        }, {} as Record<Invoice['status'], number>);
        
        const statusData = Object.entries(statusCounts).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            fill: PIE_CHART_COLORS[status as keyof typeof PIE_CHART_COLORS],
        }));
        setStatusDistribution(statusData);

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
  
  const chartConfig = {
      revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
      },
  };

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
      <div className="flex flex-col">
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
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart data={monthlyRevenue} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                      )}
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>Invoice Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                        {loading || authLoading ? <Skeleton className="w-full h-[300px]" /> : (
                           <ChartContainer config={{}} className="min-h-[300px] w-full">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                    <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                            {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}>
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ChartContainer>
                        )}
                  </CardContent>
              </Card>
          </div>

        </main>
      </div>
    </AuthGuard>
  );
}
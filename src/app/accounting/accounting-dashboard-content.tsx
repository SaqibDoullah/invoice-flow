
'use client';

import Link from 'next/link';
import { 
    Activity, 
    BookUser, 
    Landmark, 
    ArrowRight,
    Users,
    FileText,
    Receipt,
    CreditCard,
    ArrowUpDown,
    Calculator,
    RefreshCcw,
    Library
} from 'lucide-react';

import AuthGuard from '@/components/auth/auth-guard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

const MetricCard = ({ title, value, change, changeType }: { title: string, value: string, change: string, changeType: 'increase' | 'decrease' }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className={`text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
        </CardContent>
    </Card>
);

const QuickActionButton = ({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string }) => (
    <Button variant="outline" className="flex-1 min-w-[150px]" asChild>
        <Link href={href}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
        </Link>
    </Button>
);

export default function AccountingDashboardContent() {
    return (
        <AuthGuard>
            <div className="space-y-8 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Accounting Dashboard</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    <MetricCard title="Total Income" value="$12,345" change="+15% this month" changeType="increase" />
                    <MetricCard title="Total Expenses" value="$8,765" change="+5% this month" changeType="increase" />
                    <MetricCard title="Net Profit" value="$3,580" change="+45% this month" changeType="increase" />
                    <MetricCard title="Bank Balance" value="$52,110" change="+2.1% this month" changeType="increase" />
                    <MetricCard title="Inventory Value" value="$103,742" change="-0.5% this month" changeType="decrease" />
                    <MetricCard title="Outstanding Invoices" value="$4,500" change="-10% this month" changeType="decrease" />
                    <MetricCard title="Outstanding Bills" value="$2,100" change="+20% this month" changeType="increase" />
                </div>

                <div className="flex flex-wrap gap-2">
                    <QuickActionButton icon={BookUser} label="New Journal Entry" href="#" />
                    <QuickActionButton icon={FileText} label="Add Invoice" href="/invoices/new" />
                    <QuickActionButton icon={Receipt} label="Record Payment" href="/invoice-payments" />
                    <QuickActionButton icon={Receipt} label="Add Bill" href="/bills" />
                    <QuickActionButton icon={CreditCard} label="Record Payment Made" href="/bill-payments" />
                    <QuickActionButton icon={Landmark} label="Reconcile Account" href="#" />
                    <QuickActionButton icon={Calculator} label="Update Average Cost" href="/accounting/average-cost-changes" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Last 10 journal entries.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground">No transactions found.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>A/R vs A/P</CardTitle>
                             <CardDescription>Overdue vs. current receivables and payables.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="h-48">
                                <BarChart
                                    accessibilityLayer
                                    data={[{ name: 'A/R', overdue: 1200, current: 3300 }, { name: 'A/P', overdue: 500, current: 1600 }]}
                                    layout="vertical"
                                    margin={{ left: 10 }}
                                >
                                    <CartesianGrid horizontal={false} />
                                    <XAxis type="number" dataKey="value" hide />
                                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
                                    <Bar dataKey="current" fill="var(--color-chart-2)" radius={4} stackId="a" />
                                    <Bar dataKey="overdue" fill="var(--color-chart-5)" radius={4} stackId="a" />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
}


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, BarChart3, TrendingDown, TrendingUp, Ban, ArrowDown, MessageCircle } from 'lucide-react';
import { Area, AreaChart, Bar, Pie, PieChart, Cell, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart } from 'recharts';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';


const salesData = [
  { date: 'Sep 19', sales: 1 }, { date: 'Sep 20', sales: 1 },
  { date: 'Sep 21', sales: 0 }, { date: 'Sep 22', sales: 0 },
  { date: 'Sep 23', sales: 2 }, { date: 'Sep 24', sales: 1 },
  { date: 'Sep 25', sales: 1 }, { date: 'Sep 26', sales: 0 },
  { date: 'Sep 27', sales: 0 }, { date: 'Sep 28', sales: 2 },
  { date: 'Sep 29', sales: 1 }, { date: 'Sep 30', sales: 3 },
  { date: 'Oct 01', sales: 3 }, { date: 'Oct 02', sales: 2 },
  { date: 'Oct 03', sales: 2 }, { date: 'Oct 04', sales: 1 },
  { date: 'Oct 05', sales: 1 }, { date: 'Oct 06', sales: 1 },
  { date: 'Oct 07', sales: 2 }, { date: 'Oct 08', sales: 2 },
  { date: 'Oct 09', sales: 1 }, { date: 'Oct 10', sales: 2 },
  { date: 'Oct 11', sales: 1 }, { date: 'Oct 12', sales: 1 },
  { date: 'Oct 13', sales: 0 }, { date: 'Oct 14', sales: 1 },
  { date: 'Oct 15', sales: 0 },
];

const salesTotalData = [
    { date: 'Sep 19', total: 20000 }, { date: 'Sep 20', total: 25000 },
    { date: 'Sep 21', total: 0 }, { date: 'Sep 22', total: 0 },
    { date: 'Sep 23', total: 60000 }, { date: 'Sep 24', total: 15000 },
    { date: 'Sep 25', total: 20000 }, { date: 'Sep 26', total: 0 },
    { date: 'Sep 27', total: 0 }, { date: 'Sep 28', total: 40000 },
    { date: 'Sep 29', total: 10000 }, { date: 'Sep 30', total: 90000 },
    { date: 'Oct 01', total: 70000 }, { date: 'Oct 02', total: 30000 },
    { date: 'Oct 03', total: 35000 }, { date: 'Oct 04', total: 5000 },
    { date: 'Oct 05', total: 10000 }, { date: 'Oct 06', total: 15000 },
    { date: 'Oct 07', total: 45000 }, { date: 'Oct 08', total: 30000 },
    { date: 'Oct 09', total: 10000 }, { date: 'Oct 10', total: 40000 },
    { date: 'Oct 11', total: 20000 }, { date: 'Oct 12', total: 15000 },
    { date: 'Oct 13', total: 0 }, { date: 'Oct 14', total: 20000 },
    { date: 'Oct 15', total: 0 },
];

const sourceData = [
  { name: 'Source 1', value: 20, fill: '#f97316' },
  { name: 'Source 2', value: 3, fill: '#3b82f6' },
  { name: 'Source 3', value: 5, fill: '#ef4444' },
];

const fulfillmentData = [
    { status: 'Backordered', value: 0 },
    { status: 'Eligible', value: 0 },
    { status: 'Fully packed', value: 1.6 },
    { status: 'Fully shipped', value: 3.0 },
    { status: 'Incomplete', value: 2.0 },
    { status: 'No origin', value: 1.8 },
    { status: 'Other error', value: 2.0 },
];
const fulfillmentColors = {
    'Backordered': '#60a5fa',
    'Eligible': '#22c55e',
    'Fully packed': '#a855f7',
    'Fully shipped': '#3b82f6',
    'Incomplete': '#f97316',
    'No origin': '#ef4444',
    'Other error': '#f59e0b',
}

const formatCurrency = (amount: number) =>
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount);

const KpiCard = ({ title, value, change, changeType, subValue, subTitle, showSubBan = false }: { title: string, value: string, change?: string, changeType?: 'increase' | 'decrease', subValue: string, subTitle: string, showSubBan?: boolean }) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex justify-between items-start">
                <p className="text-sm text-muted-foreground">{title}</p>
                {change && (
                     <Badge variant={changeType === 'increase' ? 'default' : 'destructive'} className={changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {changeType === 'increase' ? <TrendingUp className="mr-1" /> : <TrendingDown className="mr-1" />}
                        {change}
                    </Badge>
                )}
            </div>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <div className="flex justify-between items-center mt-4 text-sm">
                <p className="text-muted-foreground">{subTitle}</p>
                <div className="flex items-center gap-1">
                     {showSubBan && <Ban className="text-red-500 w-4 h-4" />}
                     <p>{subValue}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function AnalyticsOverviewPageContent() {

  return (
    <AuthGuard>
      <div className="flex flex-col bg-muted/40">
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Analytics overview</span>
          </div>

          <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                            <BarChart3 className="w-6 h-6 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics overview</h1>
                    </div>
                </div>
          </div>
        
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="product-sales">Product sales</TabsTrigger>
              <TabsTrigger value="product-stock">Product stock</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="w-64">
                         <Select defaultValue="last-30">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="last-30">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">compared to 31 to 60 days ago</p>
                    </div>
                    <div className="w-48">
                         <Select defaultValue="day">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Day</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <KpiCard title="Gross sales" value={formatCurrency(392085)} change="-3.3%" changeType="decrease" subTitle="Net sales" subValue="--" showSubBan />
                    <KpiCard title="Number of sales" value="29" change="-6.5%" changeType="decrease" subTitle="COGS" subValue="--" showSubBan />
                    <KpiCard title="Avg. per sale" value={formatCurrency(13520)} subTitle="Gross income" subValue="--" showSubBan />
                    <KpiCard title="Avg. units per sale" value="--" change="+3.3%" changeType="increase" subTitle="Gross margin" subValue="--" showSubBan />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Purchases total</p><div className="flex justify-between items-center"><p className="text-3xl font-bold mt-1">$115,060</p><Badge variant="destructive" className="bg-red-100 text-red-800"><TrendingDown className="mr-1"/>61.8%</Badge></div><div className="flex justify-between items-center mt-4 text-sm"><p className="text-muted-foreground">Pending purchases</p><div className="flex items-center gap-1"><Ban className="text-red-500 w-4 h-4"/>--</div></div></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Inventory value (10/16/2025)</p><p className="text-3xl font-bold mt-1">$1,032,350</p><div className="flex justify-between items-center mt-4 text-sm"><p className="text-muted-foreground">Value of variances</p><div className="flex items-center gap-1"><Ban className="text-red-500 w-4 h-4"/>--</div></div></CardContent></Card>
                </div>


                <h2 className="text-xs font-semibold uppercase text-muted-foreground mt-8 mb-2">Sales</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle>Number of sales</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={150}>
                                <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]}/>
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                         <CardHeader><CardTitle>Sales total ($)</CardTitle></CardHeader>
                         <CardContent>
                            <ResponsiveContainer width="100%" height={150}>
                                <AreaChart data={salesTotalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                                    <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fontSize: 12}} domain={[0, 100000]} ticks={[0, 50000, 100000]} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                                    <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Number of sales by source</CardTitle></CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} startAngle={90} endAngle={450}>
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} (${(Number(value) / (sourceData.reduce((s,c) => s + c.value, 0)) * 100).toFixed(1)}%)` } />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-1">
                        <CardHeader><CardTitle>Number of committed sales by fulfillment status</CardTitle></CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                 <ComposedChart layout="vertical" data={fulfillmentData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                     <XAxis type="number" domain={[0, 3]} ticks={[1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0]} tick={{fontSize: 12}} />
                                     <YAxis dataKey="status" type="category" width={100} tick={{fontSize: 12}} />
                                     <Tooltip />
                                     <Legend />
                                     {Object.keys(fulfillmentColors).map(statusKey => (
                                         <Bar key={statusKey} dataKey="value" name={statusKey} stackId="a" fill={fulfillmentColors[statusKey as keyof typeof fulfillmentColors]}>
                                              {fulfillmentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.status === statusKey ? fulfillmentColors[statusKey as keyof typeof fulfillmentColors] : 'transparent'} />
                                            ))}
                                         </Bar>
                                     ))}
                                 </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                 <div className="fixed bottom-8 right-8">
                    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}


'use client';

import { useState, useEffect, useMemo }
from 'react';
import Link from 'next/link';
import { Home, ChevronRight, BarChart3, TrendingUp, TrendingDown, Ban, MessageCircle, Search } from 'lucide-react';
import { Area, AreaChart, Bar, Pie, PieChart, Cell, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, BarChart } from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { subDays, format, eachDayOfInterval, startOfDay, isValid } from 'date-fns';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { getFirestoreDb } from '@/lib/firebase-client';
import { type SalesOrder, type PurchaseOrder } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const sourceData = [
  { name: 'In-person', value: 20, fill: '#f97316' },
  { name: 'Website', value: 30, fill: '#3b82f6' },
  { name: 'unsolicited', value: 5, fill: '#ef4444' },
];

const fulfillmentData = [
    { status: 'Backordered', value: 0 },
    { status: 'Eligible', value: 1.0 },
    { status: 'Fully packed', value: 1.0 },
    { status: 'Fully shipped', value: 2.0 },
    { status: 'Incomplete', value: 1.0 },
    { status: 'No origin', value: 0 },
    { status: 'Other error', value: 0 },
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

const geoSalesData = [
    { id: "06", state: "California", value: 5 },
    { id: "48", state: "Texas", value: 20 },
    { id: "12", state: "Florida", value: 8 },
    { id: "17", state: "Illinois", value: 7 },
    { id: "36", state: "New York", value: 3 },
    { id: "34", state: "New Jersey", value: 4 },
];

const formatCurrency = (amount: number) =>
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount);

const toDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v.toDate === 'function') return v.toDate();
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
};


const KpiCard = ({ title, value, change, changeType, subValue, subTitle, isLoading }: { title: string, value: string, change?: string, changeType?: 'increase' | 'decrease', subValue: string, subTitle: string, isLoading: boolean }) => (
    <Card>
        <CardContent className="p-4">
           {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </div>
           ) : (
            <>
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
                  <p>{subValue}</p>
              </div>
            </>
           )}
        </CardContent>
    </Card>
);

const SalesChartCard = ({ title, value, change, chartData, isLoading }: { title: string, value: string, change?: string, chartData: any[], isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
                {isLoading ? (
                    <>
                     <Skeleton className="h-4 w-20" />
                     <Skeleton className="h-7 w-24" />
                    </>
                ) : (
                    <>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {change && <Badge variant="default" className="bg-green-100 text-green-800"><TrendingUp className="mr-1" /> {change}</Badge>}
                    </>
                )}
            </div>
        </CardHeader>
        <CardContent className="h-24 p-0">
             {isLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={[0, 'dataMax']} hide/>
                    </LineChart>
                </ResponsiveContainer>
             )}
        </CardContent>
    </Card>
);

export default function AnalyticsOverviewPageContent({ defaultTab = 'overview' }: { defaultTab?: string }) {
  const { user, loading: authLoading } = useAuth();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [grossSales, setGrossSales] = useState(0);
  const [netSales, setNetSales] = useState(0);
  const [numberOfSales, setNumberOfSales] = useState(0);
  const [avgPerSale, setAvgPerSale] = useState(0);
  const [salesByDay, setSalesByDay] = useState<{date: string, sales: number}[]>([]);
  const [salesTotalByDay, setSalesTotalByDay] = useState<{date: string, total: number}[]>([]);
  const [avgPerSaleByDay, setAvgPerSaleByDay] = useState<{date: string, avg: number}[]>([]);
  
  const purchaseTotal = useMemo(() => purchaseOrders.reduce((sum, po) => sum + po.total, 0), [purchaseOrders]);
  const pendingPurchaseTotal = useMemo(() => purchaseOrders.filter(po => po.status === 'draft').reduce((sum, po) => sum + po.total, 0), [purchaseOrders]);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!user || authLoading || !db) {
      if (!authLoading) setLoading(false);
      return;
    }
    
    setLoading(true);
    const thirtyDaysAgo = subDays(new Date(), 29);
    const salesQuery = query(
        collection(db, 'users', user.uid, 'sales'), 
        where('orderDate', '>=', thirtyDaysAgo)
    );

    const unsubSales = onSnapshot(salesQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SalesOrder));
        setSalesOrders(orders);
        
        const gross = orders.reduce((acc, order) => acc + order.total, 0);
        setGrossSales(gross);

        const net = orders.reduce((acc, order) => acc + order.subtotal, 0);
        setNetSales(net);
        
        const numSales = orders.length;
        setNumberOfSales(numSales);
        setAvgPerSale(numSales > 0 ? gross / numSales : 0);

        const interval = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
        const dailySalesData = interval.map(day => {
            const dayStart = startOfDay(day);
            const salesForDay = orders.filter(order => {
                const orderDate = toDate(order.orderDate);
                return orderDate && startOfDay(orderDate).getTime() === dayStart.getTime();
            });
            const salesCount = salesForDay.length;
            const totalForDay = salesForDay.reduce((acc, order) => acc + order.total, 0);
            const avgForDay = salesCount > 0 ? totalForDay / salesCount : 0;
            
            return {
                formattedDate: format(day, 'MMM dd'),
                salesCount,
                totalForDay,
                avgForDay
            };
        });
        
        setSalesByDay(dailySalesData.map(d => ({ date: d.formattedDate, sales: d.salesCount })));
        setSalesTotalByDay(dailySalesData.map(d => ({ date: d.formattedDate, total: d.totalForDay })));
        setAvgPerSaleByDay(dailySalesData.map(d => ({ date: d.formattedDate, avg: d.avgForDay })));


    }, (error) => {
        console.error("Error fetching sales data: ", error);
        setLoading(false);
    });

    const poQuery = query(collection(db, 'users', user.uid, 'purchaseOrders'));
    const unsubPOs = onSnapshot(poQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PurchaseOrder));
        setPurchaseOrders(orders);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching purchase orders:", error);
    });

    return () => {
        unsubSales();
        unsubPOs();
    };
  }, [user, authLoading]);

  const committedPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => po.status === 'committed');
  }, [purchaseOrders]);

  const purchasesBySupplier = useMemo(() => {
      const supplierData: Record<string, { count: number, total: number }> = {};
      committedPurchaseOrders.forEach(po => {
          if (!supplierData[po.supplierName]) {
              supplierData[po.supplierName] = { count: 0, total: 0 };
          }
          supplierData[po.supplierName].count += 1;
          supplierData[po.supplierName].total += po.total;
      });
      return Object.entries(supplierData).map(([name, data]) => ({ name, ...data }));
  }, [committedPurchaseOrders]);
  
  const mapData = geoSalesData; // Still mock
  const colorScale = scaleQuantile<string>()
    .domain(mapData.map(d => d.value))
    .range([
      "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#ef4444"
    ]);
    
  const finalColorScale = (val: number) => {
      if (val >= 20) return '#ef4444';
      if (val >= 15) return '#006d2c';
      if (val >= 10) return '#238b45';
      if (val >= 5) return '#74c476';
      return '#c7e9c0';
  }

  const isLoading = loading || authLoading;

  return (
    <AuthGuard>
      <div className="flex flex-col bg-muted/40">
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="w-4 h-4" /> Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Analytics</span>
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
        
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="product-sales">Product sales</TabsTrigger>
              <TabsTrigger value="product-stock">Product stock</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="w-64">
                         <Select defaultValue="last-30">
                            <SelectTrigger>
                                <SelectValue placeholder="Date range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="last-30">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48">
                         <Select defaultValue="day">
                            <SelectTrigger>
                                <SelectValue placeholder="Group by"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Day</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                    <KpiCard title="Gross sales" value={formatCurrency(grossSales)} subTitle="Net sales" subValue={formatCurrency(netSales)} isLoading={isLoading} />
                    <KpiCard title="Number of sales" value={numberOfSales.toString()} subTitle="COGS" subValue="--" isLoading={isLoading} />
                    <KpiCard title="Avg. per sale" value={formatCurrency(avgPerSale)} subTitle="Gross income" subValue="--" isLoading={isLoading} />
                    <KpiCard title="Avg. units per sale" value="--" subTitle="Gross margin" subValue="--" isLoading={isLoading} />
                    <KpiCard title="Purchases total" value={formatCurrency(purchaseTotal)} subTitle="Pending purchases" subValue={formatCurrency(pendingPurchaseTotal)} isLoading={isLoading} />
                    <KpiCard title="Inventory value (10/16/2025)" value={formatCurrency(1037424)} subTitle="Value of variances" subValue="--" isLoading={isLoading} />
                </div>


                <h2 className="text-xs font-semibold uppercase text-muted-foreground mt-8 mb-2">Sales</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 space-y-4">
                        <CardHeader className="pb-0"><CardTitle>Number of sales</CardTitle></CardHeader>
                        <CardContent>
                           {isLoading ? <Skeleton className="h-[120px] w-full" /> : (
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={salesByDay} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} allowDecimals={false}/>
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}}/>
                                </LineChart>
                            </ResponsiveContainer>
                           )}
                        </CardContent>
                         <CardHeader className="pb-0"><CardTitle>Sales total ($)</CardTitle></CardHeader>
                         <CardContent>
                            {isLoading ? <Skeleton className="h-[120px] w-full" /> : (
                            <ResponsiveContainer width="100%" height={120}>
                                <AreaChart data={salesTotalByDay} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                                    <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fontSize: 12}} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                                    <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                            )}
                        </CardContent>
                         <CardHeader className="pb-0"><CardTitle>Average per sale ($)</CardTitle></CardHeader>
                         <CardContent>
                            {isLoading ? <Skeleton className="h-[120px] w-full" /> : (
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={avgPerSaleByDay} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                                    <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fontSize: 12}} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)}/>
                                    <Line type="monotone" dataKey="avg" stroke="#8884d8" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}}/>
                                </LineChart>
                            </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
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
                                         <Legend wrapperStyle={{fontSize: "12px"}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Number of committed sales by fulfillment status</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <ComposedChart layout="vertical" data={fulfillmentData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" domain={[0, 3]} ticks={[1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0]} tick={{fontSize: 12}} />
                                        <YAxis dataKey="status" type="category" width={100} tick={{fontSize: 12}} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{fontSize: "12px"}}/>
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
                </div>

                <h2 className="text-xs font-semibold uppercase text-muted-foreground mt-8 mb-2">Purchases</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Committed purchase orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Order date</TableHead>
                                        <TableHead>Est. receive date</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {committedPurchaseOrders.slice(0, 5).map(po => (
                                        <TableRow key={po.id}>
                                            <TableCell className="font-medium text-primary">{po.orderId}</TableCell>
                                            <TableCell>{po.supplierName}</TableCell>
                                            <TableCell>{format(toDate(po.orderDate)!, 'M/d/yyyy')}</TableCell>
                                            <TableCell>{po.estimatedReceiveDate ? format(toDate(po.estimatedReceiveDate)!, 'M/d/yyyy') : 'N/A'}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(po.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Number of purchases by supplier</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={purchasesBySupplier} layout="vertical" margin={{ left: 120 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8884d8" name="Purchases" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Purchases total by supplier ($)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={purchasesBySupplier} layout="vertical" margin={{ left: 120 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickFormatter={(val) => `${val/1000}k`}/>
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="total" fill="#82ca9d" name="Total Value" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="sales" className="mt-6">
                 <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-48">
                             <Select defaultValue="last-30">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="last-30">Last 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <Input placeholder="Source" className="w-40 pl-8"/>
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        </div>
                        <div className="relative">
                            <Input placeholder="Origin" className="w-40 pl-8"/>
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">More: 1</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Filter 1</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="relative">
                            <Input placeholder="Break down by" className="w-48 pl-8"/>
                             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        </div>
                        <div className="w-32">
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
                </div>

                <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Sales</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <SalesChartCard title="Number of sales" value={numberOfSales.toString()} chartData={salesByDay} isLoading={isLoading}/>
                        <SalesChartCard title="Total units" value="--" chartData={[]} isLoading={isLoading} />
                        <SalesChartCard title="Avg. units per sale" value="--" chartData={[]} isLoading={isLoading} />
                    </div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Number of sales by geography</CardTitle>
                            <Tabs defaultValue="usa" className="w-auto">
                                <TabsList>
                                    <TabsTrigger value="usa">USA</TabsTrigger>
                                    <TabsTrigger value="europe">Europe</TabsTrigger>
                                    <TabsTrigger value="world">World</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent className="relative aspect-video">
                            <ComposableMap projection="geoAlbersUsa">
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                    geographies.map(geo => {
                                        const cur = mapData.find(s => s.id === geo.id);
                                        return (
                                            <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={cur ? finalColorScale(cur.value) : "#EEE"}
                                            />
                                        );
                                    })
                                    }
                                </Geographies>
                            </ComposableMap>
                             <div className="absolute bottom-4 right-4 bg-background/80 p-2 rounded-md border text-xs space-y-1">
                                <div className="flex items-center gap-2"><div className="w-3 h-3" style={{backgroundColor: '#ef4444'}}></div><span>20</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3" style={{backgroundColor: '#238b45'}}></div><span>15</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3" style={{backgroundColor: '#74c476'}}></div><span>10</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3" style={{backgroundColor: '#c7e9c0'}}></div><span>5</span></div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="purchases" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Committed purchase orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Order date</TableHead>
                                        <TableHead>Est. receive date</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {committedPurchaseOrders.map(po => (
                                        <TableRow key={po.id}>
                                            <TableCell className="font-medium text-primary">{po.orderId}</TableCell>
                                            <TableCell>{po.supplierName}</TableCell>
                                            <TableCell>{format(toDate(po.orderDate)!, 'M/d/yyyy')}</TableCell>
                                            <TableCell>{po.estimatedReceiveDate ? format(toDate(po.estimatedReceiveDate)!, 'M/d/yyyy') : 'N/A'}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(po.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Number of purchases by supplier</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={purchasesBySupplier} layout="vertical" margin={{ left: 120 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8884d8" name="Purchases" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Purchases total by supplier ($)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={purchasesBySupplier} layout="vertical" margin={{ left: 120 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickFormatter={(val) => `${val/1000}k`}/>
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="total" fill="#82ca9d" name="Total Value" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
          </Tabs>
           <div className="fixed bottom-8 right-8">
              <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                  <MessageCircle className="w-8 h-8" />
              </Button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

    
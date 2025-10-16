
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, BarChart3, TrendingDown, TrendingUp, Ban, MessageCircle, Search, MoreVertical, Filter } from 'lucide-react';
import { Area, AreaChart, Bar, Pie, PieChart, Cell, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart } from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

import AuthGuard from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

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

const SalesChartCard = ({ title, value, change, chartData }: { title: string, value: string, change?: string, chartData: any[] }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                 {change && <Badge variant="default" className="bg-green-100 text-green-800"><TrendingUp className="mr-1" /> {change}</Badge>}
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground"><Ban className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="h-24 p-0">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 'dataMax']} hide/>
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

export default function AnalyticsOverviewPageContent() {
  const [mapData, setMapData] = useState(geoSalesData);
  const colorScale = scaleQuantile<string>()
    .domain(mapData.map(d => d.value))
    .range([
      "#c7e9c0",
      "#a1d99b",
      "#74c476",
      "#41ab5d",
      "#238b45",
      "#006d2c",
      "#ef4444" // for highest value
    ]);
    
    // Quick hack to ensure Texas gets the red color from the screenshot
    const finalColorScale = (val: number) => {
        if (val >= 20) return '#ef4444';
        if (val >= 15) return '#006d2c';
        if (val >= 10) return '#238b45';
        if (val >= 5) return '#74c476';
        return '#c7e9c0';
    }


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
            <span>Analytics</span>
          </div>

          <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/50">
                            <BarChart3 className="w-6 h-6 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics sales</h1>
                    </div>
                </div>
          </div>
        
          <Tabs defaultValue="sales">
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
                            <p className="text-xs text-muted-foreground mt-1">compared to 31 to 60 days ago</p>
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
                        <SalesChartCard title="Number of sales" value="30" change="+3.2%" chartData={salesData} />
                        <SalesChartCard title="Total units" value="--" chartData={[]} />
                        <SalesChartCard title="Avg. units per sale" value="--" chartData={[]} />
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

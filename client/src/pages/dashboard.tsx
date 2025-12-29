import { Layout } from "@/components/layout-sidebar";
import { useDashboard } from "@/hooks/use-inventory";
import { StatCard } from "@/components/stat-card";
import { Package, DollarSign, AlertTriangle, Activity, TrendingUp, Calendar, ArrowRight, PieChart as PieChartIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Financial data usually aggregated monthly
  const chartData = data?.financialReport?.monthlyData || [
    { month: 'Tháng 1', revenue: 4500000, cost: 3000000 },
    { month: 'Tháng 2', revenue: 5200000, cost: 3500000 },
    { month: 'Tháng 3', revenue: 4800000, cost: 3200000 },
    { month: 'Tháng 4', revenue: 6100000, cost: 4000000 },
    { month: 'Tháng 5', revenue: 5500000, cost: 3800000 },
    { month: 'Tháng 6', revenue: 6700000, cost: 4200000 },
  ];

  const pieData = data?.totalMaterialsByMaterial || [
    { name: 'Sữa hạt điều', value: 400000 },
    { name: 'Sữa hạnh nhân', value: 300000 },
    { name: 'Sữa yến mạch', value: 300000 },
    { name: 'Khác', value: 200000 },
  ];

  const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b'];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Tổng quan hệ thống</h1>
            <p className="text-muted-foreground mt-1">Chào mừng trở lại, đây là tình hình kho bãi hôm nay.</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border/50 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            {format(new Date(), "EEEE, dd MMMM, yyyy")}
          </div>
        </div>

        {/* Financial Report Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Doanh thu"
            value={formatCurrency(data?.financialReport?.revenue || 0)}
            icon={TrendingUp}
            gradient="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Chi phí"
            value={formatCurrency(data?.financialReport?.cost || 0)}
            icon={ArrowRight}
            gradient="bg-red-100 text-red-600"
          />
          <StatCard
            title="Lợi nhuận"
            value={formatCurrency(data?.financialReport?.profit || 0)}
            icon={DollarSign}
            gradient="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            title="Giá trị tồn kho"
            value={formatCurrency(data?.financialReport?.inventoryValue || 0)}
            icon={Package}
            gradient="bg-purple-100 text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="font-display text-xl">Báo cáo tài chính</CardTitle>
                <CardDescription>Doanh thu và chi phí theo tháng</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [formatCurrency(value), '']}
                      />
                      <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="cost" name="Chi phí" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">Giao dịch mới nhất</CardTitle>
                    <CardDescription>Danh sách phiếu nhập và xuất kho vừa tạo</CardDescription>
                  </div>
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="pl-6">Mã phiếu</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Đối tác</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right pr-6">Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium pl-6 font-mono text-primary">{invoice.invoiceNumber || `#${invoice.id}`}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.type === 'IMPORT' ? 'default' : 'secondary'} className="rounded-md">
                            {invoice.type === 'IMPORT' ? 'NHẬP KHO' : 'XUẤT KHO'}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.partnerName || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(invoice.date!), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="text-right font-medium pr-6">{formatCurrency(invoice.total || 0)}</TableCell>
                      </TableRow>
                    ))}
                    {(!data?.recentInvoices || data.recentInvoices.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Chưa có giao dịch nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="font-display text-xl">Cơ cấu tồn kho</CardTitle>
                <CardDescription>Tỷ lệ các loại vật liệu chính</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-medium">{(entry.value as number).toLocaleString()} ml</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-primary to-emerald-700 rounded-2xl p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden flex flex-col justify-between h-[400px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl font-display font-bold mb-2">Thao tác nhanh</h3>
                <p className="text-emerald-100 mb-8">Thực hiện các nghiệp vụ kho bãi nhanh chóng.</p>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => setLocation("/import")}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left transition-all flex items-center justify-between group"
                  >
                    <span className="font-semibold">Lập phiếu nhập kho</span>
                    <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setLocation("/export")}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left transition-all flex items-center justify-between group"
                  >
                    <span className="font-semibold">Lập phiếu xuất kho</span>
                    <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setLocation("/materials")}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left transition-all flex items-center justify-between group"
                  >
                    <span className="font-semibold">Thêm vật liệu mới</span>
                    <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

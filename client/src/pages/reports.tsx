import { Layout } from "@/components/layout-sidebar";
import { useDashboard } from "@/hooks/use-inventory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Reports() {
  const { data, isLoading } = useDashboard();
  const [timeRange, setTimeRange] = useState("monthly");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const chartData = timeRange === "monthly" 
    ? (data?.financialReport?.monthlyData || [])
    : (data?.financialReport?.weeklyData || []);

  const pieData = data?.totalMaterialsByMaterial || [
    { name: 'Sữa hạt điều', value: 400000 },
    { name: 'Sữa hạnh nhân', value: 300000 },
    { name: 'Sữa yến mạch', value: 300000 },
    { name: 'Khác', value: 200000 },
  ];

  const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#f97316'];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">Đang tải báo cáo...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Báo cáo chi tiết</h1>
            <p className="text-muted-foreground mt-1">Phân tích hiệu quả kinh doanh và tồn kho.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Báo cáo theo tuần</SelectItem>
                <SelectItem value="monthly">Báo cáo theo tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display text-xl">Báo cáo tài chính</CardTitle>
                  <CardDescription>Doanh thu và chi phí {timeRange === 'monthly' ? 'theo tháng' : 'theo tuần'}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCost2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey={timeRange === 'monthly' ? "month" : "name"} axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [formatCurrency(value), '']}
                      />
                      <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue2)" />
                      <Area type="monotone" dataKey="cost" name="Chi phí" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

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
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ml`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate max-w-[150px]">{entry.name}</span>
                      </div>
                      <span className="font-medium whitespace-nowrap">{(entry.value as number).toLocaleString()} ml</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </Layout>
  );
}

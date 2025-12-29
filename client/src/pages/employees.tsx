import { Layout } from "@/components/layout-sidebar";
import { useUser } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, TrendingUp, Wallet } from "lucide-react";

export default function Employees() {
  const user = useUser();
  const { data: employees, isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/employees"] 
  });

  // Find current employee data if not admin
  const currentEmployee = employees?.find(e => e.userId === user?.id);

  if (user?.role === 'admin' || user?.role === 'manager') {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Quản lý Nhân sự</h1>
            <p className="text-muted-foreground mt-1">Theo dõi hiệu suất và lương thưởng của nhân viên.</p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Ca làm</TableHead>
                  <TableHead>Hiệu suất</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Đang tải...</TableCell></TableRow>
                ) : employees?.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.user.fullName}</TableCell>
                    <TableCell>{emp.shift || "Chưa xếp ca"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {emp.performance || "100%"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.salary || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Thông tin cá nhân</h1>
          <p className="text-muted-foreground mt-1">Xem ca làm, lương và hiệu suất công việc.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lương tháng này</CardTitle>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentEmployee?.salary || 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ca làm việc</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentEmployee?.shift || "Sáng (8h-12h)"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hiệu suất</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentEmployee?.performance || "98%"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ngày công</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22/26</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

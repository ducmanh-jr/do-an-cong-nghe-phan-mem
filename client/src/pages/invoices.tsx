import { Layout } from "@/components/layout-sidebar";
import { useInvoices } from "@/hooks/use-inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Danh sách Hóa đơn</h1>
          <p className="text-muted-foreground mt-1">Quản lý các phiếu nhập và xuất kho.</p>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="text-lg font-display">Tất cả hóa đơn</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Mã phiếu</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đối tác</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-right pr-6">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell>
                  </TableRow>
                ) : !invoices || invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có hóa đơn nào.</TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-primary pl-6 font-bold">{invoice.invoiceNumber || `#${invoice.id}`}</TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            {invoice.type === 'IMPORT' ? <ArrowDownToLine className="w-4 h-4 text-emerald-500"/> : <ArrowUpFromLine className="w-4 h-4 text-blue-500"/>}
                            <span className="font-medium">{invoice.type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}</span>
                         </div>
                      </TableCell>
                      <TableCell>{invoice.partnerName || "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.date ? format(new Date(invoice.date), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.total || 0)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Hoàn thành</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

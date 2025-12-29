import { Layout } from "@/components/layout-sidebar";
import { useInventory, useMaterials } from "@/hooks/use-inventory";
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
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function InventoryList() {
  const { data: inventory, isLoading } = useInventory();
  const { data: materials } = useMaterials();

  const getMaterialName = (id: number) => {
    return materials?.find(m => m.id === id)?.name || `Vật liệu #${id}`;
  };

  // Helper for status badge
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'expired':
        return <Badge variant="destructive" className="gap-1 rounded-md"><AlertCircle className="w-3 h-3" /> Hết hạn</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500 hover:bg-orange-600 gap-1 rounded-md"><Clock className="w-3 h-3" /> Sắp hết</Badge>;
      case 'fresh':
      default:
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1 rounded-md"><CheckCircle2 className="w-3 h-3" /> Tươi mới</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Lịch sử tồn kho</h1>
          <p className="text-muted-foreground mt-1">Chi tiết các lô hàng nhập và thời hạn sử dụng.</p>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="text-lg font-display">Các lô hàng hiện tại</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Mã lô</TableHead>
                  <TableHead>Tên vật liệu</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Ngày nhập</TableHead>
                  <TableHead>Hạn sử dụng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="pr-6">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Đang tải...</TableCell>
                  </TableRow>
                ) : inventory?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có dữ liệu tồn kho.</TableCell>
                  </TableRow>
                ) : (
                  inventory?.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-primary pl-6 font-bold">{item.batchCode || "N/A"}</TableCell>
                      <TableCell className="font-medium">{getMaterialName(item.materialId!)}</TableCell>
                      <TableCell className="font-mono">{item.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{item.date ? format(new Date(item.date), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{item.expiry ? format(new Date(item.expiry), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-[200px] pr-6">{item.note}</TableCell>
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

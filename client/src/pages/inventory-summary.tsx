import { Layout } from "@/components/layout-sidebar";
import { useInventory, useMaterials } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function InventorySummary() {
  const { data: inventory, isLoading } = useInventory();
  const { data: materials } = useMaterials();

  // Aggregate inventory by material
  const aggregatedData = materials?.map((material) => {
    const items = inventory?.filter(item => item.materialId === material.id) || [];
    
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const avgPrice = items.length > 0 
      ? Math.round(items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length)
      : 0;
    const totalValue = totalQuantity * avgPrice;

    // Get expiry status (earliest expiry date)
    const expiryDates = items
      .filter(item => item.expiry)
      .map(item => new Date(item.expiry!))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const earliestExpiry = expiryDates[0];
    const now = new Date();
    let status = 'fresh';
    
    if (earliestExpiry) {
      const daysUntilExpiry = Math.ceil((earliestExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= 30) {
        status = 'warning';
      }
    }

    return {
      materialId: material.id,
      materialName: material.name,
      materialCode: `MAT-${String(material.id).padStart(3, '0')}`,
      currentStock: totalQuantity,
      requiredStock: material.minStock || 0,
      price: avgPrice,
      totalValue,
      status,
      earliestExpiry,
      unit: material.unit,
      batchCount: items.length,
    };
  }) || [];

  const getStatusBadge = (status: string, expiry?: Date) => {
    switch (status) {
      case 'expired':
        return (
          <Badge variant="destructive" className="gap-1 rounded-md">
            <AlertCircle className="w-3 h-3" />
            Quá hạn
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 gap-1 rounded-md">
            <Clock className="w-3 h-3" />
            Sắp hết
          </Badge>
        );
      case 'fresh':
      default:
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1 rounded-md">
            <CheckCircle2 className="w-3 h-3" />
            Còn hạn
          </Badge>
        );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const totalInventoryValue = aggregatedData.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = aggregatedData.filter(item => item.currentStock < item.requiredStock).length;
  const expiredCount = aggregatedData.filter(item => item.status === 'expired').length;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tồn kho</h1>
          <p className="text-muted-foreground mt-1">Quản lý và theo dõi toàn bộ nguyên vật liệu trong kho.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Tổng giá trị kho</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalInventoryValue)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Loại vật liệu</p>
                <p className="text-2xl font-bold text-blue-600">{aggregatedData.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Dưới mức tồn kho</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Quá hạn</p>
                <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="text-lg font-display">Danh sách nguyên vật liệu</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Mã</TableHead>
                  <TableHead>Tên nguyên vật liệu</TableHead>
                  <TableHead className="text-right">Còn lại</TableHead>
                  <TableHead className="text-right">Yêu cầu</TableHead>
                  <TableHead className="text-right">Giá/đơn vị</TableHead>
                  <TableHead className="text-right">Tổng giá trị</TableHead>
                  <TableHead>Hạn sử dụng</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead className="pr-6">Số lô</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">Đang tải...</TableCell>
                  </TableRow>
                ) : aggregatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Chưa có dữ liệu tồn kho.</TableCell>
                  </TableRow>
                ) : (
                  aggregatedData.map((item) => (
                    <TableRow
                      key={item.materialId}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        item.currentStock < item.requiredStock && "bg-orange-50 dark:bg-orange-950/20",
                        item.status === 'expired' && "bg-red-50 dark:bg-red-950/20"
                      )}
                    >
                      <TableCell className="font-mono text-xs text-primary pl-6 font-bold">{item.materialCode}</TableCell>
                      <TableCell className="font-medium">{item.materialName}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={item.currentStock < item.requiredStock ? "text-orange-600 font-bold" : ""}>
                          {item.currentStock.toLocaleString()} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{item.requiredStock.toLocaleString()} {item.unit}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">{formatCurrency(item.totalValue)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.earliestExpiry ? format(item.earliestExpiry, 'dd/MM/yyyy', { locale: vi }) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status, item.earliestExpiry)}</TableCell>
                      <TableCell className="text-center pr-6 text-sm font-medium">{item.batchCount}</TableCell>
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

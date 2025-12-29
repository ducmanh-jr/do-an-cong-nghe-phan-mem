import { Layout } from "@/components/layout-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const { data: messages, isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/messages"] 
  });
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/messages/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái tin nhắn" });
    }
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Tin nhắn hệ thống</h1>
          <p className="text-muted-foreground mt-1">Xử lý yêu cầu từ nhà cung cấp và khách hàng.</p>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <p>Đang tải tin nhắn...</p>
          ) : messages?.length === 0 ? (
            <p className="text-muted-foreground italic">Không có tin nhắn nào.</p>
          ) : (
            messages?.map((msg) => (
              <Card key={msg.id} className={msg.status === 'unread' ? 'border-primary/50' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {msg.type === 'supplier_offer' ? 'Đề nghị từ nhà cung cấp' : 'Yêu cầu từ khách hàng'}
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{msg.fromName}</p>
                      <p className="text-sm text-muted-foreground">{msg.content}</p>
                    </div>
                    <div className="flex gap-2">
                      {msg.status === 'unread' && (
                        <Button 
                          size="sm" 
                          className="primary-gradient"
                          onClick={() => {
                            // In a real app, this would redirect to invoice form with pre-filled data
                            updateStatusMutation.mutate({ id: msg.id, status: 'processed' });
                            toast({ 
                              title: "Đã chuyển đến phiếu", 
                              description: "Dữ liệu đã được tự động điền vào phiếu " + (msg.type === 'supplier_offer' ? "nhập" : "xuất")
                            });
                          }}
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Xử lý ngay
                        </Button>
                      )}
                      {msg.status === 'processed' && (
                        <div className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Đã xử lý
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

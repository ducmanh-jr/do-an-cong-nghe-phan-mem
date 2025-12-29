import { useState, useEffect } from "react";
import { Layout } from "@/components/layout-sidebar";
import { useMaterials, useSuppliers, useCreateInvoice } from "@/hooks/use-inventory";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, ArrowLeft, Search, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// Schema for the form
const invoiceFormSchema = z.object({
  type: z.enum(["IMPORT", "EXPORT"]),
  partnerName: z.string().min(1, "Partner name is required"),
  note: z.string().optional(),
  items: z.array(z.object({
    materialId: z.coerce.number().min(1, "Select a material"),
    quantity: z.coerce.number().min(1, "Quantity must be > 0"),
    price: z.coerce.number().min(0, "Price must be >= 0"),
  })).min(1, "Add at least one item"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function InvoiceForm({ type }: { type: "IMPORT" | "EXPORT" }) {
  const [location, setLocation] = useLocation();
  const { data: materials } = useMaterials();
  const { data: suppliers } = useSuppliers();
  const { data: messages } = useQuery<any[]>({ queryKey: ["/api/messages"] });
  const createInvoice = useCreateInvoice();
  const { toast } = useToast();
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      type: type,
      partnerName: "",
      note: "",
      items: [{ materialId: 0, quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const totalAmount = watchItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  // Auto-fill logic from URL params (messages)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const msgId = searchParams.get('msgId');
    if (msgId && messages) {
      const msg = messages.find(m => m.id === parseInt(msgId));
      if (msg && msg.metadata) {
        form.setValue("partnerName", msg.fromName);
        form.setValue("note", `Tự động điền từ tin nhắn: ${msg.content}`);
        replace([{
          materialId: msg.metadata.materialId,
          quantity: msg.metadata.quantity,
          price: msg.metadata.price
        }]);
        toast({ title: "Đã tự động điền", description: "Dữ liệu được trích xuất từ tin nhắn" });
      }
    }
  }, [messages, form, replace, toast]);

  function onSubmit(data: InvoiceFormValues) {
    createInvoice.mutate(data, {
      onSuccess: () => {
        setLocation("/dashboard");
      }
    });
  }

  // Helper to find material price/details
  const onMaterialChange = (index: number, materialIdStr: string) => {
    const materialId = parseInt(materialIdStr);
    form.setValue(`items.${index}.materialId`, materialId);
  };

  const handlePartnerSelect = (name: string) => {
    form.setValue("partnerName", name);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {type === "IMPORT" ? "Nhập kho vật liệu" : "Xuất kho thành phẩm"}
            </h1>
            <p className="text-muted-foreground">Tạo phiếu {type === "IMPORT" ? "nhập" : "xuất"} kho mới</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="border-border/50 shadow-md">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="partnerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{type === "IMPORT" ? "Nhà cung cấp" : "Khách hàng / Bộ phận"}</FormLabel>
                        <div className="flex gap-2">
                          {type === "IMPORT" ? (
                            <Select onValueChange={handlePartnerSelect} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Chọn nhà cung cấp..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {suppliers?.map((s) => (
                                  <SelectItem key={s.id} value={s.name}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl>
                              <Input placeholder="Nhập tên người nhận..." {...field} />
                            </FormControl>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú / Tham chiếu</FormLabel>
                        <FormControl>
                          <Input placeholder="Ghi chú thêm (không bắt buộc)..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Danh sách vật liệu</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ materialId: 0, quantity: 1, price: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm dòng
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="border-border/50 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <FormLabel className="text-xs mb-1.5 block text-muted-foreground">Vật liệu</FormLabel>
                      <Select 
                        onValueChange={(val) => onMaterialChange(index, val)}
                        defaultValue={field.materialId?.toString() === "0" ? undefined : field.materialId?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vật liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials?.map((m) => (
                            <SelectItem key={m.id} value={m.id.toString()}>
                              {m.name} ({m.currentStock} {m.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.items?.[index]?.materialId && (
                        <p className="text-xs text-destructive mt-1">Bắt buộc</p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-full md:w-32">
                          <FormLabel className="text-xs text-muted-foreground">Số lượng</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="w-full md:w-40">
                          <FormLabel className="text-xs text-muted-foreground">Đơn giá (VNĐ)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="w-full md:w-32 pb-2">
                      <div className="text-xs text-muted-foreground mb-1">Thành tiền</div>
                      <div className="font-mono font-medium">
                        {(watchItems[index]?.quantity * watchItems[index]?.price || 0).toLocaleString()}đ
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between p-6 bg-card rounded-2xl border border-border/50 shadow-lg">
              <div>
                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                <h2 className="text-3xl font-display font-bold text-primary">
                  {totalAmount.toLocaleString()} VNĐ
                </h2>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  size="lg"
                  onClick={() => setLocation("/dashboard")}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl shadow-lg shadow-primary/25"
                  disabled={createInvoice.isPending}
                >
                  {createInvoice.isPending ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Lưu phiếu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout, useUser } from "@/hooks/use-auth";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function SidebarItem({ href, icon: Icon, label, active }: SidebarItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
          active
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
            : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
        )}
      >
        <Icon className={cn("w-5 h-5", active ? "text-white" : "text-muted-foreground group-hover:text-emerald-600")} />
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const logout = useLogout();
  const user = useUser();

  const menuItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/inventory-summary", icon: Package, label: "Tồn kho" },
    { href: "/materials", icon: Package, label: "Sản phẩm" },
    { href: "/invoices", icon: FileText, label: "Hóa đơn" },
    { href: "/reports", icon: BarChart3, label: "Báo cáo" },
    { href: "/suppliers", icon: Truck, label: "Nhà cung cấp" },
    { href: "/import", icon: ArrowDownToLine, label: "Nhập kho" },
    { href: "/export", icon: ArrowUpFromLine, label: "Xuất kho" },
    { href: "/inventory", icon: ClipboardList, label: "Lịch sử kho" },
    { href: "/messages", icon: Menu, label: "Tin nhắn" },
    { href: "/employees", icon: UserCircle, label: "Nhân viên" },
    { href: "/users", icon: Users, label: "Tài khoản", managerOnly: true },
  ].filter(item => !item.managerOnly || (user?.role === 'admin' || user?.role === 'manager'));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border/50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-foreground">MILK ERP</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hệ thống kho</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Danh mục</p>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            active={location === item.href}
          />
        ))}
      </div>

      <div className="p-4 border-t border-border/50 bg-secondary/5 m-4 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-emerald-100 dark:border-emerald-900">
            <AvatarImage src={`https://avatar.iran.liara.run/username?username=${user?.fullName}`} />
            <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold uppercase">
              {user?.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">{user?.fullName || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 rounded-xl"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-lg bg-card/80 backdrop-blur-md rounded-xl">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="md:pl-72 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 lg:p-12 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

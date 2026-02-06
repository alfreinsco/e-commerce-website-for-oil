"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  LogOut,
  Shield,
  UserCog,
  MapPin,
  AppWindow,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Produk",
    url: "/admin/products",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Pesanan",
    url: "/admin/orders",
    icon: ShoppingBag,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Pelanggan",
    url: "/admin/customers",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Voucher",
    url: "/admin/vouchers",
    icon: Ticket,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

const settingsSubMenu = [
  {
    title: "Akun",
    url: "/admin/settings/account",
    icon: UserCog,
  },
  {
    title: "Alamat",
    url: "/admin/settings/address",
    icon: MapPin,
  },
  {
    title: "Aplikasi",
    url: "/admin/settings/app",
    icon: AppWindow,
  },
  {
    title: "Pembayaran",
    url: "/admin/settings/payment",
    icon: CreditCard,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const getUserInitials = () => {
    if (!user?.fullName) return "A";
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r border-border/40 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SidebarHeader className="border-b border-border/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-0 backdrop-blur-sm">
        <div className="flex flex-col gap-4 p-5">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/60 to-primary/40 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-xl shadow-lg shadow-primary/20 ring-2 ring-primary/10">
                <Shield className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
                Admin Panel
              </h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">
                Lamahang Store
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Navigasi
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group relative h-12 rounded-xl transition-all duration-300 ease-out",
                        "hover:shadow-md hover:scale-[1.02]",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 shadow-lg shadow-primary/10 border border-primary/30"
                          : "hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700",
                        !isActive && "border border-transparent",
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3.5 px-4 w-full"
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                            isActive
                              ? `${item.bgColor} ${item.color} shadow-md scale-105`
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-900 dark:group-hover:text-slate-100",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4.5 h-4.5 transition-all duration-300",
                              isActive && "scale-110",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "font-medium text-sm transition-all duration-300 flex-1",
                            isActive
                              ? "text-slate-900 dark:text-slate-100 font-semibold"
                              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100",
                          )}
                        >
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute right-3 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <div className="w-1 h-6 bg-gradient-to-b from-primary/60 to-primary rounded-full" />
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Group */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pengaturan
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {settingsSubMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group relative h-12 rounded-xl transition-all duration-300 ease-out",
                        "hover:shadow-md hover:scale-[1.02]",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 shadow-lg shadow-primary/10 border border-primary/30"
                          : "hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700",
                        !isActive && "border border-transparent",
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3.5 px-4 w-full"
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                            isActive
                              ? "bg-gray-50 text-gray-600 shadow-md scale-105"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-900 dark:group-hover:text-slate-100",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4.5 h-4.5 transition-all duration-300",
                              isActive && "scale-110",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "font-medium text-sm transition-all duration-300 flex-1",
                            isActive
                              ? "text-slate-900 dark:text-slate-100 font-semibold"
                              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100",
                          )}
                        >
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute right-3 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <div className="w-1 h-6 bg-gradient-to-b from-primary/60 to-primary rounded-full" />
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/50 dark:border-slate-700/50 p-4 bg-gradient-to-t from-slate-50/80 to-transparent dark:from-slate-900/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3.5 h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 transition-all duration-300 group border border-transparent hover:shadow-md hover:scale-[1.02]"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-all duration-300">
            <LogOut className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="font-semibold text-sm">Keluar</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

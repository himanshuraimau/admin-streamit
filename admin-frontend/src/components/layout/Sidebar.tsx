import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  Gift,
  Tag,
  FileText,
  Flag,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Creator Applications", href: "/creators", icon: UserCheck },
  { name: "Payments", href: "/payments", icon: DollarSign },
  { name: "Virtual Gifts", href: "/gifts", icon: Gift },
  { name: "Discount Codes", href: "/discounts", icon: Tag },
  { name: "Content", href: "/content", icon: FileText },
  { name: "Reports", href: "/reports", icon: Flag },
  { name: "Activity Logs", href: "/logs", icon: Activity },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-12 items-center px-4">
          <h1 className="text-xl font-bold truncate group-data-[collapsible=icon]:hidden">
            StreamIt Admin
          </h1>
          <span className="text-xl font-bold hidden group-data-[collapsible=icon]:block">
            S
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

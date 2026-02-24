'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  ChevronUp,
  ShieldCheck,
  Tags,
} from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Navigation items for People Hub
const mainNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Personas',
    url: '/people',
    icon: Users,
  },
  {
    title: 'Vacantes',
    url: '/positions',
    icon: Briefcase,
  },
  {
    title: 'Feedback',
    url: '/feedback',
    icon: MessageSquare,
  },
];

const settingsNavItems = [
  {
    title: 'Configuración',
    url: '/settings',
    icon: Settings,
  },
];

const adminNavItems = [
  {
    title: 'Gestión de Usuarios',
    url: '/admin/users',
    icon: ShieldCheck,
    roles: ['super_admin'],
  },
  {
    title: 'Configuración de Estados',
    url: '/admin/statuses',
    icon: Tags,
    roles: ['hr_admin', 'super_admin'],
  },
];

interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export function AppSidebar({ user: userProp }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { profile, signOut } = useAuth();
  const isCollapsed = state === 'collapsed';

  // Use prop if provided (server-side data), otherwise use context
  const user =
    userProp ||
    (profile
      ? {
          name: profile.full_name,
          email: profile.email,
          role: profile.role,
        }
      : undefined);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      recruiter: 'Recruiter',
      manager: 'Manager',
      hr_admin: 'HR Admin',
      super_admin: 'Super Admin',
    };
    return roleLabels[role] || role;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">People Hub</span>
              <span className="text-xs text-muted-foreground">HR Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(user?.role === 'super_admin' || user?.role === 'hr_admin') && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems
                  .filter(item => user?.role && item.roles.includes(user.role))
                  .map(item => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user ? getInitials(user.name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-1 flex-col items-start text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name || 'Usuario'}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user ? getRoleLabel(user.role) : 'Sin rol'}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && <ChevronUp className="ml-auto h-4 w-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user ? getInitials(user.name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name || 'Usuario'}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive"
                  data-testid="logout-btn"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

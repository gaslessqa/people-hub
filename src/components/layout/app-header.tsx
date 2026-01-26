'use client';

import { Menu, Bell, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </SidebarTrigger>

      <Separator orientation="vertical" className="mr-2 h-6" />

      {title && <h1 className="text-lg font-semibold">{title}</h1>}

      <div className="flex-1" />

      {/* Search bar - visible on larger screens */}
      <div className="hidden md:flex md:w-80">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Buscar personas, vacantes..." className="pl-10" />
        </div>
      </div>

      {/* Search button - visible on mobile */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Search className="h-5 w-5" />
        <span className="sr-only">Buscar</span>
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
            <span className="sr-only">Notificaciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold">Notificaciones</span>
            <Button variant="ghost" size="sm" className="text-xs">
              Marcar todo como leído
            </Button>
          </div>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <span className="font-medium">Nuevo feedback recibido</span>
            <span className="text-xs text-muted-foreground">
              María García dejó feedback sobre Juan Pérez
            </span>
            <span className="text-xs text-muted-foreground">Hace 5 minutos</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <span className="font-medium">Candidato en etapa final</span>
            <span className="text-xs text-muted-foreground">
              Carlos López avanzó a "Oferta" en Frontend Developer
            </span>
            <span className="text-xs text-muted-foreground">Hace 1 hora</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <span className="font-medium">Nueva vacante creada</span>
            <span className="text-xs text-muted-foreground">
              Se abrió la vacante "Product Manager"
            </span>
            <span className="text-xs text-muted-foreground">Hace 3 horas</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

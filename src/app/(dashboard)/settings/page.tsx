import { Settings } from 'lucide-react';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu cuenta y del sistema
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Próximamente</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            Esta sección te permitirá configurar tu perfil, preferencias de notificaciones, y
            opciones de administración del sistema.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

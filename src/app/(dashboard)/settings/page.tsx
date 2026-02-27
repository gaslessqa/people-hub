import { NotificationPreferences } from '@/components/features/settings/notification-preferences';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu cuenta y preferencias de notificación
        </p>
      </div>

      <NotificationPreferences />
    </div>
  );
}

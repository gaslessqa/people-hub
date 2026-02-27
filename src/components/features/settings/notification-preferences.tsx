'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Bell, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { NotificationSettings } from '@/lib/notifications/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/lib/notifications/types';

interface NotificationTypeConfig {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}

const NOTIFICATION_TYPE_CONFIGS: NotificationTypeConfig[] = [
  {
    key: 'new_candidate_assigned',
    label: 'Nuevo candidato asignado',
    description: 'Cuando se asigna un candidato a una de tus vacantes.',
  },
  {
    key: 'feedback_received',
    label: 'Feedback de entrevista recibido',
    description: 'Cuando un manager registra feedback para un candidato tuyo.',
  },
  {
    key: 'status_change',
    label: 'Cambios de estado',
    description: 'Cuando el estado de un candidato cambia en el proceso.',
  },
  {
    key: 'weekly_summary',
    label: 'Resumen semanal',
    description: 'Un resumen de la actividad de la semana cada lunes.',
  },
  {
    key: 'system_announcements',
    label: 'Anuncios del sistema',
    description: 'Comunicados importantes sobre la plataforma.',
  },
];

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/notifications');
      if (!res.ok) throw new Error('Error al cargar preferencias');
      const data = (await res.json()) as { settings: NotificationSettings };
      setSettings(data.settings);
    } catch {
      toast.error('No se pudieron cargar las preferencias de notificación');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  function toggleEmail(key: keyof NotificationSettings) {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], email: !prev[key].email },
    }));
  }

  function resetToDefaults() {
    setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Error al guardar');
      toast.success('Preferencias guardadas correctamente');
    } catch {
      toast.error('No se pudieron guardar las preferencias');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card data-testid="notificationPreferences">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferencias de notificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="notificationPreferences">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferencias de notificación
        </CardTitle>
        <CardDescription>Controla qué notificaciones recibes y por qué canales.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Channel legend */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Tipo de notificación</span>
          <div className="ml-auto flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </div>
        </div>

        <Separator />

        {/* Notification rows */}
        <div className="space-y-1" data-testid="notification_settings">
          {NOTIFICATION_TYPE_CONFIGS.map((config, idx) => (
            <div key={config.key}>
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">{config.label}</p>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>

                {/* Email toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings[config.key].email}
                  aria-label={`Email para ${config.label}`}
                  data-testid={`notification-toggle-${config.key}`}
                  onClick={() => toggleEmail(config.key)}
                  className={[
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    settings[config.key].email ? 'bg-primary' : 'bg-input',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                      settings[config.key].email ? 'translate-x-5' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </div>
              {idx < NOTIFICATION_TYPE_CONFIGS.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            disabled={saving}
          >
            Restablecer predeterminados
          </Button>

          <Button
            type="button"
            data-testid="notification-save-button"
            onClick={() => void saveSettings()}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar preferencias'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

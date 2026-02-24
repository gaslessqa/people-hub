'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/constants/role-permissions';

export function RolePermissionsMatrix() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg" data-testid="role-permissions-matrix">
      <Button
        type="button"
        variant="ghost"
        className="w-full flex items-center justify-between p-4 h-auto"
        onClick={() => setExpanded(prev => !prev)}
        data-testid="role-permissions-toggle"
        aria-expanded={expanded}
      >
        <span className="font-medium text-sm">Ver permisos por rol</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      {expanded && (
        <div className="overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Permiso</th>
                {ROLE_PERMISSIONS.map(r => (
                  <th key={r.role} className="text-center p-3 font-medium">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((permission, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground">{permission.label}</td>
                  {ROLE_PERMISSIONS.map(r => (
                    <td key={r.role} className="p-3 text-center">
                      {r.permissions.includes(permission.label) ? (
                        <Check className="h-4 w-4 text-green-600 mx-auto" aria-label="Permitido" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 mx-auto" aria-label="No permitido" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

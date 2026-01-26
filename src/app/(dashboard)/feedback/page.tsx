import { MessageSquare } from 'lucide-react';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">Visualiza y gestiona el feedback de candidatos</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Próximamente</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            Esta funcionalidad estará disponible en una próxima actualización. Por ahora, puedes ver
            el feedback directamente en el perfil de cada candidato.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

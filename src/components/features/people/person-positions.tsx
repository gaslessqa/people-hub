import Link from 'next/link';
import { Briefcase, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STAGE_LABELS } from '@/lib/utils/people';

interface PersonPositionEntry {
  position_id: string;
  title: string;
  stage: string;
}

interface PersonPositionsProps {
  positions: PersonPositionEntry[];
}

const stageColors: Record<string, string> = {
  sourced: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  applied: 'bg-cyan-100 text-cyan-700',
  screening: 'bg-yellow-100 text-yellow-700',
  interviewing: 'bg-orange-100 text-orange-700',
  offer: 'bg-purple-100 text-purple-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

export function PersonPositions({ positions }: PersonPositionsProps) {
  return (
    <Card data-testid="person_positions_section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Vacantes ({positions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No está asignado a ninguna vacante actualmente.
          </p>
        ) : (
          <ul className="space-y-2">
            {positions.map((pp, idx) => (
              <li
                key={pp.position_id || idx}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {pp.position_id ? (
                    <Link
                      href={`/positions/${pp.position_id}`}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {pp.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium truncate">{pp.title}</span>
                  )}
                  {pp.position_id && (
                    <Link href={`/positions/${pp.position_id}`} className="shrink-0">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={`shrink-0 ${stageColors[pp.stage] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {STAGE_LABELS[pp.stage] ?? pp.stage}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

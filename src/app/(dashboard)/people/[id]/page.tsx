import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { PersonHeader } from '@/components/features/people/person-header';
import { PersonDetails } from '@/components/features/people/person-details';
import { PersonTimeline } from '@/components/features/people/person-timeline';
import { PersonPositions } from '@/components/features/people/person-positions';
import { PersonNotes } from '@/components/features/people/person-notes';
import { PersonFeedback } from '@/components/features/people/person-feedback';
import { ChangeStatusButton } from '@/components/features/people/change-status-button';

interface PersonProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PersonProfilePage({ params }: PersonProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch person + status history + positions + timeline + notes + feedback in parallel
  const [
    personResult,
    statusHistoryResult,
    positionsResult,
    timelineResult,
    notesResult,
    feedbackResult,
  ] = await Promise.all([
    supabase.from('people').select('*').eq('id', id).single(),

    supabase
      .from('person_statuses')
      .select('id, created_at, comment, status_definitions(*)')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase.from('person_positions').select('stage, positions(id, title)').eq('person_id', id),

    supabase
      .from('activity_log')
      .select('action_type, description, created_at, performed_by, new_value')
      .eq('person_id', id)
      .order('created_at', { ascending: false })
      .limit(50),

    supabase
      .from('notes')
      .select('*')
      .eq('person_id', id)
      .order('created_at', { ascending: false }),

    supabase
      .from('feedback')
      .select('*')
      .eq('person_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (personResult.error || !personResult.data) {
    notFound();
  }

  const person = personResult.data;
  const statusHistory = statusHistoryResult.data ?? [];

  // Current status = latest status entry
  const latestStatus = statusHistory[0];
  const currentStatusDef = latestStatus?.status_definitions as
    | { id: string; label: string; color: string; status_value: string; status_type: string }
    | null
    | undefined;
  const currentStatus = currentStatusDef
    ? { label: currentStatusDef.label, color: currentStatusDef.color }
    : null;

  // Collect all profile IDs that need name resolution
  const rawTimeline = timelineResult.data ?? [];
  const rawNotes = notesResult.data ?? [];
  const rawFeedback = feedbackResult.data ?? [];

  const profileIds = new Set([
    ...rawTimeline.map(e => e.performed_by),
    ...rawNotes.map(n => n.created_by),
    ...rawFeedback.map(f => f.given_by),
  ]);

  let profileMap: Record<string, string> = {};
  if (profileIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', [...profileIds]);
    profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]));
  }

  const timeline = rawTimeline.map(entry => ({
    action_type: entry.action_type,
    description: entry.description,
    performed_by_name: profileMap[entry.performed_by] ?? null,
    created_at: entry.created_at,
    new_value: entry.new_value as Record<string, unknown> | null,
  }));

  const notes = rawNotes.map(note => ({
    ...note,
    created_by_name: profileMap[note.created_by] ?? null,
  }));

  const feedback = rawFeedback.map(fb => ({
    ...fb,
    given_by_name: profileMap[fb.given_by] ?? null,
  }));

  const positions = (positionsResult.data ?? []).map(pp => {
    const pos = pp.positions as { id: string; title: string } | null;
    return {
      position_id: pos?.id ?? '',
      title: pos?.title ?? 'Vacante desconocida',
      stage: pp.stage,
    };
  });

  // Positions for feedback filter (deduplicated)
  const positionsForFilter = positions
    .filter(p => p.position_id)
    .map(p => ({ id: p.position_id, title: p.title }));

  return (
    <div className="space-y-6" data-testid="personProfilePage">
      {/* Top bar: back + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/people">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Personas
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" asChild data-testid="edit_person_btn">
            <Link href={`/people/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <ChangeStatusButton
            personId={id}
            currentStatusValue={currentStatusDef?.status_value ?? null}
          />
        </div>
      </div>

      {/* Header: avatar, name, status */}
      <PersonHeader person={person} currentStatus={currentStatus} />

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-1 space-y-6">
          <PersonDetails person={person} />
        </div>

        {/* Right: positions + notes + feedback + timeline */}
        <div className="lg:col-span-2 space-y-6">
          <PersonPositions positions={positions} />
          <PersonNotes personId={id} initialNotes={notes} />
          <PersonFeedback personId={id} initialFeedback={feedback} positions={positionsForFilter} />
          <PersonTimeline entries={timeline} />
        </div>
      </div>
    </div>
  );
}

/**
 * Type Helpers for People Hub
 *
 * These types are extracted from the auto-generated Supabase types
 * for easier usage in components and pages.
 */

import type { Database } from '@/types/supabase';

// =============================================================================
// Table Row Types (for reading data)
// =============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Person = Database['public']['Tables']['people']['Row'];
export type Position = Database['public']['Tables']['positions']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type StatusDefinition = Database['public']['Tables']['status_definitions']['Row'];
export type PersonStatus = Database['public']['Tables']['person_statuses']['Row'];
export type PersonPosition = Database['public']['Tables']['person_positions']['Row'];

// =============================================================================
// Insert Types (for creating data)
// =============================================================================

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type PersonInsert = Database['public']['Tables']['people']['Insert'];
export type PositionInsert = Database['public']['Tables']['positions']['Insert'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];

// =============================================================================
// Update Types (for updating data)
// =============================================================================

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type PersonUpdate = Database['public']['Tables']['people']['Update'];
export type PositionUpdate = Database['public']['Tables']['positions']['Update'];
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

// =============================================================================
// Enum Types
// =============================================================================

export type UserRole = Database['public']['Enums']['user_role'];
export type StatusType = Database['public']['Enums']['status_type'];
export type EmploymentType = Database['public']['Enums']['employment_type'];
export type PositionStatus = Database['public']['Enums']['position_status'];
export type PipelineStage = Database['public']['Enums']['pipeline_stage'];
export type FeedbackType = Database['public']['Enums']['feedback_type'];
export type Recommendation = Database['public']['Enums']['recommendation'];
export type PersonSource = Database['public']['Enums']['person_source'];
export type Priority = Database['public']['Enums']['priority'];

// =============================================================================
// Derived Types (for common use cases)
// =============================================================================

/**
 * Person with their current status
 */
export type PersonWithStatus = Person & {
  current_status?: StatusDefinition | null;
};

/**
 * Person with their positions in the pipeline
 */
export type PersonWithPositions = Person & {
  person_positions: (PersonPosition & {
    positions: Position | null;
  })[];
};

/**
 * Position with assigned people
 */
export type PositionWithPipeline = Position & {
  person_positions: (PersonPosition & {
    people: Person | null;
  })[];
  hiring_manager?: Profile | null;
  recruiter?: Profile | null;
};

/**
 * Full person detail with all relations
 */
export type PersonDetail = Person & {
  current_status?: StatusDefinition | null;
  person_positions: (PersonPosition & {
    positions: Position | null;
  })[];
  feedback: Feedback[];
  notes: Note[];
  activity_log: ActivityLog[];
};

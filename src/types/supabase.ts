/**
 * Supabase Database Types
 *
 * This file contains auto-generated TypeScript types from the Supabase database schema.
 *
 * To regenerate these types after schema changes, run:
 * npx supabase gen types typescript --project-id ylkwhejmcymlowcqgibn > src/types/supabase.ts
 *
 * Or use the Supabase CLI:
 * supabase gen types typescript --project-id ylkwhejmcymlowcqgibn --schema public > src/types/supabase.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          id: string;
          person_id: string;
          performed_by: string;
          action_type: string;
          old_value: Json | null;
          new_value: Json | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          performed_by: string;
          action_type: string;
          old_value?: Json | null;
          new_value?: Json | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          performed_by?: string;
          action_type?: string;
          old_value?: Json | null;
          new_value?: Json | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_person_id_fkey';
            columns: ['person_id'];
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_log_performed_by_fkey';
            columns: ['performed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback: {
        Row: {
          id: string;
          person_id: string;
          position_id: string | null;
          given_by: string;
          feedback_type: Database['public']['Enums']['feedback_type'];
          rating: number;
          recommendation: Database['public']['Enums']['recommendation'];
          strengths: string | null;
          concerns: string | null;
          comments: string;
          is_confidential: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          position_id?: string | null;
          given_by: string;
          feedback_type: Database['public']['Enums']['feedback_type'];
          rating: number;
          recommendation: Database['public']['Enums']['recommendation'];
          strengths?: string | null;
          concerns?: string | null;
          comments: string;
          is_confidential?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          position_id?: string | null;
          given_by?: string;
          feedback_type?: Database['public']['Enums']['feedback_type'];
          rating?: number;
          recommendation?: Database['public']['Enums']['recommendation'];
          strengths?: string | null;
          concerns?: string | null;
          comments?: string;
          is_confidential?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_given_by_fkey';
            columns: ['given_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_person_id_fkey';
            columns: ['person_id'];
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_position_id_fkey';
            columns: ['position_id'];
            referencedRelation: 'positions';
            referencedColumns: ['id'];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          person_id: string;
          created_by: string;
          content: string;
          is_private: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          created_by: string;
          content: string;
          is_private?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          created_by?: string;
          content?: string;
          is_private?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_person_id_fkey';
            columns: ['person_id'];
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_log: {
        Row: {
          id: string;
          user_id: string;
          notification_type: string;
          payload: Json;
          is_sent: boolean;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_type: string;
          payload?: Json;
          is_sent?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_type?: string;
          payload?: Json;
          is_sent?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_log_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      people: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          linkedin_url: string | null;
          current_company: string | null;
          current_position: string | null;
          location: string | null;
          source: Database['public']['Enums']['person_source'] | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          linkedin_url?: string | null;
          current_company?: string | null;
          current_position?: string | null;
          location?: string | null;
          source?: Database['public']['Enums']['person_source'] | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          linkedin_url?: string | null;
          current_company?: string | null;
          current_position?: string | null;
          location?: string | null;
          source?: Database['public']['Enums']['person_source'] | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'people_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      person_positions: {
        Row: {
          id: string;
          person_id: string;
          position_id: string;
          stage: Database['public']['Enums']['pipeline_stage'];
          assigned_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          position_id: string;
          stage?: Database['public']['Enums']['pipeline_stage'];
          assigned_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          position_id?: string;
          stage?: Database['public']['Enums']['pipeline_stage'];
          assigned_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'person_positions_person_id_fkey';
            columns: ['person_id'];
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_positions_position_id_fkey';
            columns: ['position_id'];
            referencedRelation: 'positions';
            referencedColumns: ['id'];
          },
        ];
      };
      person_statuses: {
        Row: {
          id: string;
          person_id: string;
          status_definition_id: string;
          comment: string | null;
          changed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          status_definition_id: string;
          comment?: string | null;
          changed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          status_definition_id?: string;
          comment?: string | null;
          changed_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'person_statuses_changed_by_fkey';
            columns: ['changed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_statuses_person_id_fkey';
            columns: ['person_id'];
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_statuses_status_definition_id_fkey';
            columns: ['status_definition_id'];
            referencedRelation: 'status_definitions';
            referencedColumns: ['id'];
          },
        ];
      };
      positions: {
        Row: {
          id: string;
          title: string;
          department: string | null;
          description: string | null;
          requirements: string | null;
          location: string | null;
          employment_type: Database['public']['Enums']['employment_type'] | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string | null;
          hiring_manager_id: string | null;
          recruiter_id: string | null;
          priority: Database['public']['Enums']['priority'] | null;
          status: Database['public']['Enums']['position_status'];
          close_reason: Database['public']['Enums']['close_reason'] | null;
          hired_person_id: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          department?: string | null;
          description?: string | null;
          requirements?: string | null;
          location?: string | null;
          employment_type?: Database['public']['Enums']['employment_type'] | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          hiring_manager_id?: string | null;
          recruiter_id?: string | null;
          priority?: Database['public']['Enums']['priority'] | null;
          status?: Database['public']['Enums']['position_status'];
          close_reason?: Database['public']['Enums']['close_reason'] | null;
          hired_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          department?: string | null;
          description?: string | null;
          requirements?: string | null;
          location?: string | null;
          employment_type?: Database['public']['Enums']['employment_type'] | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          hiring_manager_id?: string | null;
          recruiter_id?: string | null;
          priority?: Database['public']['Enums']['priority'] | null;
          status?: Database['public']['Enums']['position_status'];
          close_reason?: Database['public']['Enums']['close_reason'] | null;
          hired_person_id?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'positions_hired_person_id_fkey';
            columns: ['hired_person_id'];
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'positions_hiring_manager_id_fkey';
            columns: ['hiring_manager_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'positions_recruiter_id_fkey';
            columns: ['recruiter_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          role: Database['public']['Enums']['user_role'];
          is_active: boolean;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          role?: Database['public']['Enums']['user_role'];
          is_active?: boolean;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          full_name?: string;
          email?: string;
          role?: Database['public']['Enums']['user_role'];
          is_active?: boolean;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      status_definitions: {
        Row: {
          id: string;
          status_type: Database['public']['Enums']['status_type'];
          status_value: string;
          label: string;
          color: string;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          status_type: Database['public']['Enums']['status_type'];
          status_value: string;
          label: string;
          color?: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          status_type?: Database['public']['Enums']['status_type'];
          status_value?: string;
          label?: string;
          color?: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          notification_settings: Json;
          ui_settings: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_settings?: Json;
          ui_settings?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_settings?: Json;
          ui_settings?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_user_profile_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database['public']['Enums']['user_role'];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_manager_of_position: {
        Args: { pos_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      close_reason: 'filled' | 'cancelled' | 'on_hold';
      employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
      feedback_type: 'technical' | 'cultural' | 'final' | 'other';
      person_source: 'linkedin' | 'referral' | 'job_board' | 'direct' | 'other';
      pipeline_stage:
        | 'applied'
        | 'screening'
        | 'interviewing'
        | 'finalist'
        | 'offer'
        | 'hired'
        | 'rejected';
      position_status: 'open' | 'on_hold' | 'closed';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
      status_type: 'candidate' | 'employee' | 'external';
      user_role: 'recruiter' | 'manager' | 'hr_admin' | 'super_admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// =============================================================================
// Helper Types
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// =============================================================================
// Convenience Type Aliases
// =============================================================================

export type Profile = Tables<'profiles'>;
export type Person = Tables<'people'>;
export type Position = Tables<'positions'>;
export type StatusDefinition = Tables<'status_definitions'>;
export type PersonStatus = Tables<'person_statuses'>;
export type PersonPosition = Tables<'person_positions'>;
export type Feedback = Tables<'feedback'>;
export type Note = Tables<'notes'>;
export type ActivityLog = Tables<'activity_log'>;
export type NotificationLog = Tables<'notification_log'>;
export type UserPreference = Tables<'user_preferences'>;

export type UserRole = Enums<'user_role'>;
export type StatusType = Enums<'status_type'>;
export type EmploymentType = Enums<'employment_type'>;
export type PositionStatus = Enums<'position_status'>;
export type CloseReason = Enums<'close_reason'>;
export type PipelineStage = Enums<'pipeline_stage'>;
export type FeedbackType = Enums<'feedback_type'>;
export type Recommendation = Enums<'recommendation'>;
export type PersonSource = Enums<'person_source'>;
export type Priority = Enums<'priority'>;

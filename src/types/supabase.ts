export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string;
          created_at: string;
          description: string | null;
          id: string;
          new_value: Json | null;
          old_value: Json | null;
          performed_by: string;
          person_id: string | null;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
          performed_by: string;
          person_id?: string | null;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
          performed_by?: string;
          person_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_performed_by_fkey';
            columns: ['performed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_log_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback: {
        Row: {
          comments: string;
          concerns: string | null;
          created_at: string;
          feedback_type: Database['public']['Enums']['feedback_type'];
          given_by: string;
          id: string;
          is_confidential: boolean;
          person_id: string;
          position_id: string | null;
          rating: number;
          recommendation: Database['public']['Enums']['recommendation'];
          strengths: string | null;
        };
        Insert: {
          comments: string;
          concerns?: string | null;
          created_at?: string;
          feedback_type: Database['public']['Enums']['feedback_type'];
          given_by: string;
          id?: string;
          is_confidential?: boolean;
          person_id: string;
          position_id?: string | null;
          rating: number;
          recommendation: Database['public']['Enums']['recommendation'];
          strengths?: string | null;
        };
        Update: {
          comments?: string;
          concerns?: string | null;
          created_at?: string;
          feedback_type?: Database['public']['Enums']['feedback_type'];
          given_by?: string;
          id?: string;
          is_confidential?: boolean;
          person_id?: string;
          position_id?: string | null;
          rating?: number;
          recommendation?: Database['public']['Enums']['recommendation'];
          strengths?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_given_by_fkey';
            columns: ['given_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_position_id_fkey';
            columns: ['position_id'];
            isOneToOne: false;
            referencedRelation: 'positions';
            referencedColumns: ['id'];
          },
        ];
      };
      notes: {
        Row: {
          content: string;
          created_at: string;
          created_by: string;
          id: string;
          is_private: boolean;
          person_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          created_by: string;
          id?: string;
          is_private?: boolean;
          person_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_private?: boolean;
          person_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_log: {
        Row: {
          created_at: string;
          id: string;
          is_sent: boolean;
          notification_type: string;
          payload: Json;
          sent_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_sent?: boolean;
          notification_type: string;
          payload?: Json;
          sent_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_sent?: boolean;
          notification_type?: string;
          payload?: Json;
          sent_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      people: {
        Row: {
          created_at: string;
          created_by: string;
          current_company: string | null;
          current_position: string | null;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          linkedin_url: string | null;
          location: string | null;
          phone: string | null;
          source: Database['public']['Enums']['person_source'] | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          current_company?: string | null;
          current_position?: string | null;
          email: string;
          first_name: string;
          id?: string;
          last_name: string;
          linkedin_url?: string | null;
          location?: string | null;
          phone?: string | null;
          source?: Database['public']['Enums']['person_source'] | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          current_company?: string | null;
          current_position?: string | null;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          linkedin_url?: string | null;
          location?: string | null;
          phone?: string | null;
          source?: Database['public']['Enums']['person_source'] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'people_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      person_positions: {
        Row: {
          assigned_at: string;
          id: string;
          person_id: string;
          position_id: string;
          stage: Database['public']['Enums']['pipeline_stage'];
          updated_at: string;
        };
        Insert: {
          assigned_at?: string;
          id?: string;
          person_id: string;
          position_id: string;
          stage?: Database['public']['Enums']['pipeline_stage'];
          updated_at?: string;
        };
        Update: {
          assigned_at?: string;
          id?: string;
          person_id?: string;
          position_id?: string;
          stage?: Database['public']['Enums']['pipeline_stage'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'person_positions_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_positions_position_id_fkey';
            columns: ['position_id'];
            isOneToOne: false;
            referencedRelation: 'positions';
            referencedColumns: ['id'];
          },
        ];
      };
      person_statuses: {
        Row: {
          changed_by: string;
          comment: string | null;
          created_at: string;
          id: string;
          person_id: string;
          status_definition_id: string;
        };
        Insert: {
          changed_by: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          person_id: string;
          status_definition_id: string;
        };
        Update: {
          changed_by?: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          person_id?: string;
          status_definition_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'person_statuses_changed_by_fkey';
            columns: ['changed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_statuses_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_statuses_status_definition_id_fkey';
            columns: ['status_definition_id'];
            isOneToOne: false;
            referencedRelation: 'status_definitions';
            referencedColumns: ['id'];
          },
        ];
      };
      positions: {
        Row: {
          close_reason: Database['public']['Enums']['close_reason'] | null;
          closed_at: string | null;
          created_at: string;
          department: string | null;
          description: string | null;
          employment_type: Database['public']['Enums']['employment_type'] | null;
          hired_person_id: string | null;
          hiring_manager_id: string | null;
          id: string;
          location: string | null;
          priority: Database['public']['Enums']['priority'] | null;
          recruiter_id: string | null;
          requirements: string | null;
          salary_currency: string | null;
          salary_max: number | null;
          salary_min: number | null;
          status: Database['public']['Enums']['position_status'];
          title: string;
          updated_at: string;
        };
        Insert: {
          close_reason?: Database['public']['Enums']['close_reason'] | null;
          closed_at?: string | null;
          created_at?: string;
          department?: string | null;
          description?: string | null;
          employment_type?: Database['public']['Enums']['employment_type'] | null;
          hired_person_id?: string | null;
          hiring_manager_id?: string | null;
          id?: string;
          location?: string | null;
          priority?: Database['public']['Enums']['priority'] | null;
          recruiter_id?: string | null;
          requirements?: string | null;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          status?: Database['public']['Enums']['position_status'];
          title: string;
          updated_at?: string;
        };
        Update: {
          close_reason?: Database['public']['Enums']['close_reason'] | null;
          closed_at?: string | null;
          created_at?: string;
          department?: string | null;
          description?: string | null;
          employment_type?: Database['public']['Enums']['employment_type'] | null;
          hired_person_id?: string | null;
          hiring_manager_id?: string | null;
          id?: string;
          location?: string | null;
          priority?: Database['public']['Enums']['priority'] | null;
          recruiter_id?: string | null;
          requirements?: string | null;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          status?: Database['public']['Enums']['position_status'];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'positions_hired_person_id_fkey';
            columns: ['hired_person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'positions_hiring_manager_id_fkey';
            columns: ['hiring_manager_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'positions_recruiter_id_fkey';
            columns: ['recruiter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          auth_user_id: string;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          preferences: Json | null;
          role: Database['public']['Enums']['user_role'];
          updated_at: string;
        };
        Insert: {
          auth_user_id: string;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          preferences?: Json | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Update: {
          auth_user_id?: string;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          preferences?: Json | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Relationships: [];
      };
      status_definitions: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          is_active: boolean;
          label: string;
          order_index: number;
          status_type: Database['public']['Enums']['status_type'];
          status_value: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label: string;
          order_index?: number;
          status_type: Database['public']['Enums']['status_type'];
          status_value: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          order_index?: number;
          status_type?: Database['public']['Enums']['status_type'];
          status_value?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          notification_settings: Json;
          ui_settings: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          notification_settings?: Json;
          ui_settings?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          notification_settings?: Json;
          ui_settings?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
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
      get_current_user_profile_id: { Args: never; Returns: string };
      get_current_user_role: {
        Args: never;
        Returns: Database['public']['Enums']['user_role'];
      };
      is_admin: { Args: never; Returns: boolean };
      is_manager_of_position: { Args: { pos_id: string }; Returns: boolean };
      is_super_admin: { Args: never; Returns: boolean };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      close_reason: ['filled', 'cancelled', 'on_hold'],
      employment_type: ['full_time', 'part_time', 'contract', 'internship'],
      feedback_type: ['technical', 'cultural', 'final', 'other'],
      person_source: ['linkedin', 'referral', 'job_board', 'direct', 'other'],
      pipeline_stage: [
        'applied',
        'screening',
        'interviewing',
        'finalist',
        'offer',
        'hired',
        'rejected',
      ],
      position_status: ['open', 'on_hold', 'closed'],
      priority: ['low', 'medium', 'high', 'urgent'],
      recommendation: ['strong_yes', 'yes', 'maybe', 'no', 'strong_no'],
      status_type: ['candidate', 'employee', 'external'],
      user_role: ['recruiter', 'manager', 'hr_admin', 'super_admin'],
    },
  },
} as const;

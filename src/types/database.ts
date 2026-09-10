export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          condition_type: string
          condition_value: number
          description_es: string
          icon: string | null
          id: string
          title_es: string
        }
        Insert: {
          code: string
          condition_type: string
          condition_value: number
          description_es: string
          icon?: string | null
          id?: string
          title_es: string
        }
        Update: {
          code?: string
          condition_type?: string
          condition_value?: number
          description_es?: string
          icon?: string | null
          id?: string
          title_es?: string
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          activity_date: string
          exercises_answered: number
          lessons_completed: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date: string
          exercises_answered?: number
          lessons_completed?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          exercises_answered?: number
          lessons_completed?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          correct_count: number
          exam_id: string
          finished_at: string | null
          id: string
          passed: boolean
          score: number | null
          started_at: string
          total_count: number
          user_id: string
        }
        Insert: {
          correct_count?: number
          exam_id: string
          finished_at?: string | null
          id?: string
          passed?: boolean
          score?: number | null
          started_at?: string
          total_count?: number
          user_id: string
        }
        Update: {
          correct_count?: number
          exam_id?: string
          finished_at?: string | null
          id?: string
          passed?: boolean
          score?: number | null
          started_at?: string
          total_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          id: string
          level_id: string
          max_attempts_per_day: number
          passing_score: number
          question_count: number
          time_limit_seconds: number | null
          title_es: string
        }
        Insert: {
          id?: string
          level_id: string
          max_attempts_per_day?: number
          passing_score?: number
          question_count?: number
          time_limit_seconds?: number | null
          title_es: string
        }
        Update: {
          id?: string
          level_id?: string
          max_attempts_per_day?: number
          passing_score?: number
          question_count?: number
          time_limit_seconds?: number | null
          title_es?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: true
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_answers: {
        Row: {
          answered_at: string
          exam_attempt_id: string | null
          exercise_id: string
          id: string
          is_correct: boolean
          lesson_attempt_id: string | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          answered_at?: string
          exam_attempt_id?: string | null
          exercise_id: string
          id?: string
          is_correct: boolean
          lesson_attempt_id?: string | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          answered_at?: string
          exam_attempt_id?: string | null
          exercise_id?: string
          id?: string
          is_correct?: boolean
          lesson_attempt_id?: string | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_answers_exam_attempt_id_fkey"
            columns: ["exam_attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_answers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_answers_lesson_attempt_id_fkey"
            columns: ["lesson_attempt_id"]
            isOneToOne: false
            referencedRelation: "lesson_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_options: {
        Row: {
          exercise_id: string
          id: string
          image_url: string | null
          is_correct: boolean
          label: string
          order_index: number
        }
        Insert: {
          exercise_id: string
          id?: string
          image_url?: string | null
          is_correct?: boolean
          label: string
          order_index?: number
        }
        Update: {
          exercise_id?: string
          id?: string
          image_url?: string | null
          is_correct?: boolean
          label?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_options_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          audio_url: string | null
          correct_answer: string
          created_at: string
          difficulty: number
          explanation: string | null
          hint: string | null
          id: string
          image_url: string | null
          is_exam_pool: boolean
          lesson_id: string | null
          level_id: string
          order_index: number
          prompt_ay: string | null
          prompt_es: string | null
          tokens: Json | null
          type: Database["public"]["Enums"]["exercise_type"]
          vocabulary_id: string | null
        }
        Insert: {
          audio_url?: string | null
          correct_answer: string
          created_at?: string
          difficulty?: number
          explanation?: string | null
          hint?: string | null
          id?: string
          image_url?: string | null
          is_exam_pool?: boolean
          lesson_id?: string | null
          level_id: string
          order_index?: number
          prompt_ay?: string | null
          prompt_es?: string | null
          tokens?: Json | null
          type: Database["public"]["Enums"]["exercise_type"]
          vocabulary_id?: string | null
        }
        Update: {
          audio_url?: string | null
          correct_answer?: string
          created_at?: string
          difficulty?: number
          explanation?: string | null
          hint?: string | null
          id?: string
          image_url?: string | null
          is_exam_pool?: boolean
          lesson_id?: string | null
          level_id?: string
          order_index?: number
          prompt_ay?: string | null
          prompt_es?: string | null
          tokens?: Json | null
          type?: Database["public"]["Enums"]["exercise_type"]
          vocabulary_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      google_translate_usage: {
        Row: {
          characters_used: number
          updated_at: string
          usage_month: string
        }
        Insert: {
          characters_used?: number
          updated_at?: string
          usage_month: string
        }
        Update: {
          characters_used?: number
          updated_at?: string
          usage_month?: string
        }
        Relationships: []
      }
      lesson_attempts: {
        Row: {
          correct_count: number
          finished_at: string | null
          id: string
          lesson_id: string
          score: number | null
          started_at: string
          total_count: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          correct_count?: number
          finished_at?: string | null
          id?: string
          lesson_id: string
          score?: number | null
          started_at?: string
          total_count?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          correct_count?: number
          finished_at?: string | null
          id?: string
          lesson_id?: string
          score?: number | null
          started_at?: string
          total_count?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          cultural_note: string | null
          estimated_minutes: number
          id: string
          is_published: boolean
          level_id: string
          objective_es: string | null
          order_index: number
          title_ay: string | null
          title_es: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          cultural_note?: string | null
          estimated_minutes?: number
          id?: string
          is_published?: boolean
          level_id: string
          objective_es?: string | null
          order_index: number
          title_ay?: string | null
          title_es: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          cultural_note?: string | null
          estimated_minutes?: number
          id?: string
          is_published?: boolean
          level_id?: string
          objective_es?: string | null
          order_index?: number
          title_ay?: string | null
          title_es?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          code: string
          color_hex: string
          created_at: string
          description_es: string | null
          icon: string | null
          id: string
          is_published: boolean
          order_index: number
          title_ay: string | null
          title_es: string
        }
        Insert: {
          code: string
          color_hex?: string
          created_at?: string
          description_es?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          order_index: number
          title_ay?: string | null
          title_es: string
        }
        Update: {
          code?: string
          color_hex?: string
          created_at?: string
          description_es?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          title_ay?: string | null
          title_es?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          daily_goal_xp: number
          full_name: string | null
          id: string
          last_activity_date: string | null
          longest_streak: number
          onboarding_done: boolean
          updated_at: string
          username: string | null
          xp_total: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          daily_goal_xp?: number
          full_name?: string | null
          id: string
          last_activity_date?: string | null
          longest_streak?: number
          onboarding_done?: boolean
          updated_at?: string
          username?: string | null
          xp_total?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          daily_goal_xp?: number
          full_name?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          onboarding_done?: boolean
          updated_at?: string
          username?: string | null
          xp_total?: number
        }
        Relationships: []
      }
      translation_suggestions: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["suggestion_status"]
          suggested_text: string
          translation_id: string
          upvotes: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["suggestion_status"]
          suggested_text: string
          translation_id: string
          upvotes?: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["suggestion_status"]
          suggested_text?: string
          translation_id?: string
          upvotes?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_suggestions_translation_id_fkey"
            columns: ["translation_id"]
            isOneToOne: false
            referencedRelation: "translations"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          confidence: number
          created_at: string
          id: string
          source: Database["public"]["Enums"]["translation_source"]
          source_key: string
          source_lang: string
          source_text: string
          target_lang: string
          target_text: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          source?: Database["public"]["Enums"]["translation_source"]
          source_key: string
          source_lang: string
          source_text: string
          target_lang: string
          target_text: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          source?: Database["public"]["Enums"]["translation_source"]
          source_key?: string
          source_lang?: string
          source_text?: string
          target_lang?: string
          target_text?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      tutor_messages: {
        Row: {
          content: string
          content_translation: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["tutor_role"]
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          content_translation?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["tutor_role"]
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          content_translation?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["tutor_role"]
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tutor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          attempts: number
          best_score: number
          completed_at: string | null
          last_attempt_at: string | null
          lesson_id: string
          status: Database["public"]["Enums"]["progress_status"]
          user_id: string
        }
        Insert: {
          attempts?: number
          best_score?: number
          completed_at?: string | null
          last_attempt_at?: string | null
          lesson_id: string
          status?: Database["public"]["Enums"]["progress_status"]
          user_id: string
        }
        Update: {
          attempts?: number
          best_score?: number
          completed_at?: string | null
          last_attempt_at?: string | null
          lesson_id?: string
          status?: Database["public"]["Enums"]["progress_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_level_progress: {
        Row: {
          best_exam_score: number | null
          completed_at: string | null
          level_id: string
          status: Database["public"]["Enums"]["progress_status"]
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          best_exam_score?: number | null
          completed_at?: string | null
          level_id: string
          status?: Database["public"]["Enums"]["progress_status"]
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          best_exam_score?: number | null
          completed_at?: string | null
          level_id?: string
          status?: Database["public"]["Enums"]["progress_status"]
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_level_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_vocabulary: {
        Row: {
          first_seen_at: string
          next_review_at: string
          strength: number
          times_correct: number
          times_seen: number
          user_id: string
          vocabulary_id: string
        }
        Insert: {
          first_seen_at?: string
          next_review_at?: string
          strength?: number
          times_correct?: number
          times_seen?: number
          user_id: string
          vocabulary_id: string
        }
        Update: {
          first_seen_at?: string
          next_review_at?: string
          strength?: number
          times_correct?: number
          times_seen?: number
          user_id?: string
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_vocabulary_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary: {
        Row: {
          audio_url: string | null
          aymara: string
          created_at: string
          cultural_note: string | null
          id: string
          image_url: string | null
          is_verified: boolean
          lesson_id: string | null
          level_id: string | null
          part_of_speech: string | null
          phonetic: string | null
          spanish: string
        }
        Insert: {
          audio_url?: string | null
          aymara: string
          created_at?: string
          cultural_note?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          lesson_id?: string | null
          level_id?: string | null
          part_of_speech?: string | null
          phonetic?: string | null
          spanish: string
        }
        Update: {
          audio_url?: string | null
          aymara?: string
          created_at?: string
          cultural_note?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          lesson_id?: string | null
          level_id?: string | null
          part_of_speech?: string | null
          phonetic?: string | null
          spanish?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      answer_matches: {
        Args: { p_correct: string; p_user_answer: string }
        Returns: boolean
      }
      complete_lesson: {
        Args: { p_answers: Json; p_attempt_id: string }
        Returns: Json
      }
      get_exam_questions: {
        Args: { p_exam_id: string }
        Returns: {
          audio_url: string | null
          correct_answer: string
          created_at: string
          difficulty: number
          explanation: string | null
          hint: string | null
          id: string
          image_url: string | null
          is_exam_pool: boolean
          lesson_id: string | null
          level_id: string
          order_index: number
          prompt_ay: string | null
          prompt_es: string | null
          tokens: Json | null
          type: Database["public"]["Enums"]["exercise_type"]
          vocabulary_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "exercises"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_learned_vocabulary: {
        Args: never
        Returns: {
          aymara: string
          part_of_speech: string
          spanish: string
        }[]
      }
      get_review_queue: {
        Args: { p_limit?: number }
        Returns: {
          audio_url: string | null
          correct_answer: string
          created_at: string
          difficulty: number
          explanation: string | null
          hint: string | null
          id: string
          image_url: string | null
          is_exam_pool: boolean
          lesson_id: string | null
          level_id: string
          order_index: number
          prompt_ay: string | null
          prompt_es: string | null
          tokens: Json | null
          type: Database["public"]["Enums"]["exercise_type"]
          vocabulary_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "exercises"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      normalize_text: { Args: { p_text: string }; Returns: string }
      register_activity: {
        Args: {
          p_exercises?: number
          p_lessons?: number
          p_user_id: string
          p_xp: number
        }
        Returns: undefined
      }
      reinforce_vocabulary: {
        Args: { p_correct: boolean; p_user_id: string; p_vocabulary_id: string }
        Returns: undefined
      }
      reserve_google_translate_chars: {
        Args: { p_chars: number }
        Returns: boolean
      }
      start_lesson: { Args: { p_lesson_id: string }; Returns: string }
      submit_exam: {
        Args: { p_answers: Json; p_exam_id: string }
        Returns: Json
      }
    }
    Enums: {
      exercise_type:
        | "multiple_choice"
        | "listen_and_choose"
        | "listen_and_type"
        | "translate_to_aymara"
        | "word_order"
        | "match_pairs"
        | "look_and_type"
      progress_status: "locked" | "unlocked" | "in_progress" | "completed"
      suggestion_status: "pending" | "approved" | "rejected"
      translation_source: "dictionary" | "ai" | "community"
      tutor_role: "user" | "assistant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      exercise_type: [
        "multiple_choice",
        "listen_and_choose",
        "listen_and_type",
        "translate_to_aymara",
        "word_order",
        "match_pairs",
        "look_and_type",
      ],
      progress_status: ["locked", "unlocked", "in_progress", "completed"],
      suggestion_status: ["pending", "approved", "rejected"],
      translation_source: ["dictionary", "ai", "community"],
      tutor_role: ["user", "assistant"],
    },
  },
} as const

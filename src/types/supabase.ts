
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: number
          name: string
          joinedAt: string
          active?: boolean
        }
        Insert: {
          id?: number
          name: string
          joinedAt?: string
          active?: boolean
        }
        Update: {
          id?: number
          name?: string
          joinedAt?: string
          active?: boolean
        }
      }
      orders: {
        Row: {
          id: number
          agent_id: number
          timestamp: string
        }
        Insert: {
          id?: number
          agent_id: number
          timestamp?: string
        }
        Update: {
          id?: number
          agent_id?: number
          timestamp?: string
        }
      }
      global_state: {
        Row: {
          id: number
          current_agent_id: number
        }
        Insert: {
          id?: number
          current_agent_id: number
        }
        Update: {
          id?: number
          current_agent_id?: number
        }
      }
      agent_profiles: {
        Row: {
          id: number
          user_id: string
          name: string
          active: boolean
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          active?: boolean
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          active?: boolean
        }
      }
    }
  }
}

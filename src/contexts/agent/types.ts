
import { Agent } from '@/types';

export interface AgentContextState {
  agents: Agent[];
  currentAgentId: number | null;
  currentAgent: Agent | null;
  currentUserAgent: Agent | null;
  isCurrentUserTurn: boolean;
  isLoading: boolean;
}

export interface AgentContextActions {
  setCurrentUserAgent: (agent: Agent | null) => void;
  submitOrder: (orderId: string, description?: string) => Promise<void>;
  advanceTurn: () => Promise<void>;
  addAgent: (name: string) => Promise<any>;
  toggleAgentActive: (agentId: number, active: boolean) => Promise<void>;
}

export type AgentContextType = AgentContextState & AgentContextActions;

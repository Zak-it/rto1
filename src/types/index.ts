
export interface Agent {
  id: number;
  name: string;
  joinedAt: string;
  active?: boolean;
  order_count?: number;
  status?: 'active' | 'frozen' | 'skipped'; // New field for agent status
  average_completion_time?: number; // New field for performance stats
  turn_skips?: number; // New field for performance stats
  response_delay?: number; // New field for performance stats
}

export interface Order {
  id: number;
  agent_id: number;
  timestamp: string;
  completion_time?: number; // New field for how long the order took to complete
}

export interface GlobalState {
  id: number;
  current_agent_id: number;
  turn_start_time?: string; // New field to track when the turn started
}

export interface AgentContextType {
  agents: Agent[];
  currentAgentId: number | null;
  currentAgent: Agent | null;
  isCurrentUserTurn: boolean;
  currentUserAgent: Agent | null;
  setCurrentUserAgent: (agent: Agent | null) => void;
  submitOrder: (orderId: string) => Promise<void>;
  advanceTurn: () => Promise<void>;
  addAgent: (name: string) => Promise<void>;
  toggleAgentActive: (agentId: number, active: boolean) => Promise<void>;
  isLoading: boolean;
}

export interface OrderContextType {
  orders: Order[];
  isLoadingOrders: boolean;
  getOrdersByAgentId: (agentId: number) => Order[];
  getCompletedOrderCount: () => number;
  getPendingOrderCount: () => number;
  getCancelledOrderCount: () => number;
  filterOrdersByDateRange: (range: 'hour' | 'today' | 'yesterday' | 'all') => Order[];
  refreshOrders: () => void;
}

// Application theme colors
export const COLORS = {
  PRIMARY: '#9b87f5',       // Primary purple
  QUEUE_ACTIVE: '#1E40AF',  // Active queue color (bright blue)
  SUCCESS: '#0FA0CE',       // Success color (soft blue)
  ERROR: '#ea384c',         // Error color (red)
  USER_BADGE: '#00C38A',    // User badge color (green)
  WARNING: '#FFA500',       // Warning color (orange)
  FROZEN: '#6B7280',        // Frozen agent color (gray)
};

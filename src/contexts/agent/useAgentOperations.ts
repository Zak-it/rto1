
import { useState } from 'react';
import { Agent } from '@/types';
import { AgentContextState } from './types';
import { useAgentData } from './useAgentData';
import { useUserAgent } from './useUserAgent';
import { useAgentSubscriptions } from './useAgentSubscriptions';

export const useAgentOperations = (user: any | null, isAuthenticated: boolean) => {
  const [currentAgentId, setCurrentAgentId] = useState<number | null>(null);
  
  // Get agents data
  const { agents, setAgents, isLoading } = useAgentData({
    isAuthenticated,
    user,
    setCurrentAgentId,
    setCurrentUserAgent: () => {} // We'll replace this with the real setter below
  });
  
  // Get user agent state
  const { currentUserAgent, setCurrentUserAgent } = useUserAgent({
    user,
    isAuthenticated,
    agents
  });
  
  // Set up Supabase subscriptions
  useAgentSubscriptions({
    setAgents,
    setCurrentAgentId,
    currentUserAgent
  });
  
  // Derived state
  const currentAgent = agents.find(agent => agent.id === currentAgentId) || null;
  const isCurrentUserTurn = currentUserAgent?.id === currentAgentId;

  // Construct the state object
  const state: AgentContextState = {
    agents,
    currentAgentId,
    currentAgent,
    currentUserAgent,
    isCurrentUserTurn,
    isLoading
  };

  // Return state and utilities
  return {
    state,
    setAgents,
    setCurrentAgentId,
    setCurrentUserAgent,
    setIsLoading: () => {} // This is no longer used directly but kept for compatibility
  };
};


import React, { createContext, useContext, useEffect } from 'react';
import { useAgentOperations } from './useAgentOperations';
import { createAgentActions } from './agentActions';
import { useAuth } from '@/contexts/AuthContext';
import { AgentContextType } from './types';
import { Agent } from '@/types';

// Create the context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Get state and state setters
  const { 
    state, 
    setAgents, 
    setCurrentAgentId, 
    setCurrentUserAgent 
  } = useAgentOperations(user, isAuthenticated);
  
  // Create actions
  const actions = createAgentActions(
    state.agents,
    setAgents,
    state.currentAgentId,
    setCurrentAgentId,
    state.currentUserAgent
  );

  // Reset agent context when auth state changes
  useEffect(() => {
    console.log("Auth state changed in AgentProvider:", { isAuthenticated, user });
    if (!isAuthenticated) {
      setCurrentUserAgent(null);
    }
  }, [isAuthenticated, setCurrentUserAgent, user]);

  // Combine state and actions
  const contextValue: AgentContextType = {
    ...state,
    setCurrentUserAgent: (agent: Agent | null) => {
      console.log("Setting current user agent in context:", agent);
      setCurrentUserAgent(agent);
    },
    ...actions
  };

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

// Create and export the hook
export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

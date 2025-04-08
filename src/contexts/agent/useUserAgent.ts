
import { useState, useEffect } from 'react';
import { Agent } from '@/types';

type UserAgentProps = {
  user: any | null;
  isAuthenticated: boolean;
  agents: Agent[];
};

export const useUserAgent = ({ user, isAuthenticated, agents }: UserAgentProps) => {
  const [currentUserAgent, setCurrentUserAgent] = useState<Agent | null>(null);

  // Reset state when user changes or auth state changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCurrentUserAgent(null);
    }
  }, [isAuthenticated, user]);

  // Find user's agent in the loaded agents
  useEffect(() => {
    if (user && agents.length > 0) {
      const userAgent = agents.find(agent => agent.id === user.id);
      if (userAgent) {
        console.log('Setting current user agent from agents list:', userAgent);
        setCurrentUserAgent(userAgent);
        localStorage.setItem('currentUserAgentId', userAgent.id.toString());
      } else {
        console.log('User agent not found in agents list:', user);
      }
    }
  }, [user, agents]);

  return {
    currentUserAgent,
    setCurrentUserAgent
  };
};

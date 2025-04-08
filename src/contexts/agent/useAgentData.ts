
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/types';
import { toast } from 'sonner';

interface UseAgentDataProps {
  isAuthenticated: boolean;
  user: any | null;
  setCurrentAgentId: React.Dispatch<React.SetStateAction<number | null>>;
  setCurrentUserAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
}

export const useAgentData = ({
  isAuthenticated,
  user,
  setCurrentAgentId,
  setCurrentUserAgent
}: UseAgentDataProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch agents and current turn information
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        
        // Fetch agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('*');
        
        if (agentsError) throw agentsError;
        
        // Fetch orders for order count
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        // Fetch current turn info
        const { data: stateData, error: stateError } = await supabase
          .from('global_state')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (stateError && stateError.code !== 'PGRST116') {
          // PGRST116 is "row not found", which is fine for initial setup
          throw stateError;
        }
        
        // Process agents and count their orders
        const processedAgents = agentsData.map(agent => {
          const agentOrders = ordersData.filter(order => order.agent_id === agent.id);
          
          // Calculate performance metrics
          let totalCompletionTime = 0;
          let ordersWithCompletionTime = 0;
          
          agentOrders.forEach(order => {
            if (order.completion_time) {
              totalCompletionTime += order.completion_time;
              ordersWithCompletionTime++;
            }
          });
          
          const averageCompletionTime = ordersWithCompletionTime > 0
            ? totalCompletionTime / ordersWithCompletionTime
            : undefined;
          
          return {
            ...agent,
            active: agent.active !== undefined ? agent.active : true, // Default to active if not set
            order_count: agentOrders.length,
            // Set default status if not present
            status: agent.status || 'active',
            // Add performance metrics
            average_completion_time: agent.average_completion_time || averageCompletionTime || 0,
            turn_skips: agent.turn_skips || 0,
            response_delay: agent.response_delay || 0
          };
        });
        
        setAgents(processedAgents);
        
        // Set current agent ID from state if it exists
        if (stateData) {
          setCurrentAgentId(stateData.current_agent_id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching agent data:', error);
        toast.error('Failed to load agents');
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchAgents();
    } else {
      setAgents([]);
      setCurrentAgentId(null);
      setCurrentUserAgent(null);
    }
  }, [isAuthenticated, setCurrentAgentId, setCurrentUserAgent]);

  return { agents, setAgents, isLoading };
};

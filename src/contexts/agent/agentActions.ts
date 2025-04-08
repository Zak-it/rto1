
import { supabase } from '@/lib/supabase';
import { Agent } from '@/types';
import { toast } from 'sonner';

export const createAgentActions = (
  agents: Agent[], 
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>,
  currentAgentId: number | null,
  setCurrentAgentId: React.Dispatch<React.SetStateAction<number | null>>,
  currentUserAgent: Agent | null
) => {
  const addAgent = async (name: string) => {
    try {
      // Remove the 'active' field since it doesn't exist in the database schema
      const { data, error } = await supabase
        .from('agents')
        .insert([{ 
          name, 
          joinedAt: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        // Check if it's a connection timeout error
        if (error.message && error.message.includes('timeout')) {
          toast.error('Connection timeout. Please try again.');
        } else {
          throw error;
        }
      }
      
      if (data && data.length > 0) {
        if (agents.length === 0) {
          await supabase
            .from('global_state')
            .upsert([{ id: 1, current_agent_id: data[0].id }]);
        }
        
        // Add the agent to the local state with implicit active status
        setAgents(prev => [...prev, {
          ...data[0], 
          active: true,
          status: 'active', // Set initial status
          average_completion_time: 0,
          turn_skips: 0,
          response_delay: 0
        }]);
        
        toast.success(`Agent ${name} added successfully`);
        return data[0];
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      toast.error('Failed to add agent');
    }
  };

  const toggleAgentActive = async (agentId: number, active: boolean) => {
    try {
      // Get current timestamp
      const timestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('agents')
        .update({ 
          active,
          // If deactivating, update status to frozen, otherwise to active
          status: active ? 'active' : 'frozen'
        })
        .eq('id', agentId);
        
      if (error) {
        // Check if it's a connection timeout error
        if (error.message && error.message.includes('timeout')) {
          toast.error('Connection timeout. Please try again.');
          return;
        }
        throw error;
      }
      
      setAgents(prev => 
        prev.map(agent => 
          agent.id === agentId ? { 
            ...agent, 
            active, 
            status: active ? 'active' : 'frozen'
          } : agent
        )
      );
      
      // If we're deactivating the current turn agent, advance to next
      if (!active && agentId === currentAgentId) {
        await advanceTurn();
      }
      
      toast.success(`Agent ${active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling agent active status:', error);
      toast.error('Failed to update agent status');
    }
  };

  const advanceTurn = async () => {
    try {
      const activeAgents = agents.filter(agent => agent.active && agent.status !== 'frozen');
      
      if (activeAgents.length === 0) {
        toast.error('No active agents available');
        return;
      }
      
      const currentIndex = activeAgents.findIndex(a => a.id === currentAgentId);
      
      const nextIndex = (currentIndex + 1) % activeAgents.length;
      
      const nextAgentId = activeAgents[nextIndex].id;
      
      // Update turn start time along with the current agent ID
      const turnStartTime = new Date().toISOString();
      
      const { error } = await supabase
        .from('global_state')
        .update({ 
          current_agent_id: nextAgentId,
          turn_start_time: turnStartTime
        })
        .eq('id', 1);
      
      if (error) {
        // Check if it's a connection timeout error
        if (error.message && error.message.includes('timeout')) {
          toast.error('Connection timeout. Please try again.');
          return;
        }
        throw error;
      }
      
      setCurrentAgentId(nextAgentId);
    } catch (error) {
      console.error('Error advancing turn:', error);
      toast.error('Failed to advance to next agent');
    }
  };

  const submitOrder = async (orderId: string, description?: string) => {
    if (!currentUserAgent) {
      toast.error('You must select an agent first');
      return;
    }
    
    if (currentAgentId !== currentUserAgent.id) {
      toast.error("It's not your turn yet");
      return;
    }
    
    try {
      console.log('Submitting order:', { 
        agent_id: currentUserAgent.id,
        timestamp: new Date().toISOString(),
        order_id: orderId // We store this for reference, even though it's not in DB schema
      });
      
      // Calculate completion time if we have turn start time in global state
      let completionTime = null;
      
      // Fetch the global state to get turn start time
      const { data: globalStateData, error: globalStateError } = await supabase
        .from('global_state')
        .select('turn_start_time')
        .eq('id', 1)
        .single();
      
      if (!globalStateError && globalStateData && globalStateData.turn_start_time) {
        const turnStartTime = new Date(globalStateData.turn_start_time).getTime();
        const submissionTime = new Date().getTime();
        completionTime = Math.round((submissionTime - turnStartTime) / 1000); // in seconds
      }
      
      // Insert the order with completion time if available
      const orderData: any = {
        agent_id: currentUserAgent.id,
        timestamp: new Date().toISOString()
      };
      
      if (completionTime !== null) {
        orderData.completion_time = completionTime;
      }
      
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select();
      
      if (error) {
        console.error('Order insertion error details:', error);
        // Check if it's a connection timeout error
        if (error.message && error.message.includes('timeout')) {
          toast.error('Connection timeout. Please try again.');
          return;
        }
        throw error;
      }
      
      console.log('Order submitted successfully:', data);
      
      // Update the agent's performance metrics if completion time is available
      if (completionTime !== null) {
        // Get current agent to calculate new average
        const currentAgent = agents.find(a => a.id === currentUserAgent.id);
        if (currentAgent) {
          const currentAvg = currentAgent.average_completion_time || 0;
          const currentOrders = currentAgent.order_count || 0;
          
          // Calculate new average completion time
          const newAverage = currentOrders > 0
            ? ((currentAvg * currentOrders) + completionTime) / (currentOrders + 1)
            : completionTime;
          
          // Update agent metrics in database
          await supabase
            .from('agents')
            .update({
              average_completion_time: newAverage
            })
            .eq('id', currentUserAgent.id);
          
          // Update local state
          setAgents(prev => 
            prev.map(agent => 
              agent.id === currentUserAgent.id 
                ? { 
                    ...agent, 
                    order_count: (agent.order_count || 0) + 1,
                    average_completion_time: newAverage
                  } 
                : agent
            )
          );
        }
      } else {
        // Update the local agent order count immediately for better UI responsiveness
        setAgents(prev => 
          prev.map(agent => 
            agent.id === currentUserAgent.id 
              ? { ...agent, order_count: (agent.order_count || 0) + 1 } 
              : agent
          )
        );
      }
      
      // Move to the next agent's turn
      await advanceTurn();
      
      toast.success(`Order ${orderId} submitted successfully`);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order');
      throw error;
    }
  };

  return {
    addAgent,
    toggleAgentActive,
    advanceTurn,
    submitOrder
  };
};


import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent, GlobalState } from '@/types';
import { toast } from 'sonner';
import { playNotificationSound } from '@/utils/notificationUtils';

type SubscriptionsProps = {
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  setCurrentAgentId: React.Dispatch<React.SetStateAction<number | null>>;
  currentUserAgent: Agent | null;
};

export const useAgentSubscriptions = ({ 
  setAgents, 
  setCurrentAgentId, 
  currentUserAgent 
}: SubscriptionsProps) => {
  
  useEffect(() => {
    let agentsSubscription: any = null;
    let globalStateSubscription: any = null;
    let ordersSubscription: any = null;

    // Set up subscriptions
    agentsSubscription = supabase
      .channel('agents-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'agents' 
      }, (payload) => {
        console.log('Agents change received:', payload);
        
        if (payload.eventType === 'INSERT') {
          setAgents(prev => [...prev, { 
            ...payload.new as Agent, 
            active: true,
            order_count: 0 
          }]);
        } else if (payload.eventType === 'UPDATE') {
          setAgents(prev => 
            prev.map(agent => 
              agent.id === payload.new.id ? { 
                ...agent, 
                ...payload.new as Agent,
                active: agent.active 
              } : agent
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setAgents(prev => prev.filter(agent => agent.id !== payload.old.id));
        }
      })
      .subscribe((status) => {
        console.log('Agents subscription status:', status);
      });

    // Subscribe to orders table for real-time order count updates
    ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('Order inserted:', payload);
        // Update the order count for the specific agent
        setAgents(prev => 
          prev.map(agent => 
            agent.id === payload.new.agent_id ? { 
              ...agent, 
              order_count: (agent.order_count || 0) + 1 
            } : agent
          )
        );
      })
      .subscribe((status) => {
        console.log('Orders subscription status:', status);
      });

    globalStateSubscription = supabase
      .channel('global-state-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'global_state',
        filter: 'id=eq.1'
      }, (payload) => {
        console.log('Global state change received:', payload);
        const newState = payload.new as GlobalState;
        setCurrentAgentId(newState.current_agent_id);
        
        // Check if the currentUserAgent is set and matches the new turn
        if (currentUserAgent && newState.current_agent_id === currentUserAgent.id) {
          toast.success("It's your turn now!", {
            description: "You can submit an order",
            icon: "/lovable-uploads/3425fca3-90da-40b2-97f6-bcabe242d2b2.png"
          });
          
          playNotificationSound();
          
          if (Notification.permission === 'granted') {
            new Notification("It's your turn!", {
              body: "You can now submit an order",
              icon: "/lovable-uploads/3425fca3-90da-40b2-97f6-bcabe242d2b2.png"
            });
          }
          
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      })
      .subscribe((status) => {
        console.log('Global state subscription status:', status);
      });

    return () => {
      // Clean up subscriptions
      if (agentsSubscription) {
        supabase.removeChannel(agentsSubscription);
      }
      
      if (globalStateSubscription) {
        supabase.removeChannel(globalStateSubscription);
      }
      
      if (ordersSubscription) {
        supabase.removeChannel(ordersSubscription);
      }
    };
  }, [setAgents, setCurrentAgentId, currentUserAgent]);
};


import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order, OrderContextType } from '@/types';
import { toast } from 'sonner';
import { addHours, startOfDay, endOfDay, subDays } from 'date-fns';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const fetchOrders = async () => {
    // Prevent rapid refetches
    const now = Date.now();
    if (now - lastRefresh < 2000) return;
    
    setLastRefresh(now);
    setIsLoadingOrders(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        // Handle connection timeout errors
        if (error.message && error.message.includes('timeout')) {
          if (retryCount < 3) {
            // Retry after a delay
            console.log(`Connection timeout, retrying (${retryCount + 1}/3)...`);
            setRetryCount(prev => prev + 1);
            setTimeout(fetchOrders, 2000);
            return;
          } else {
            // After multiple retries, show a more specific error
            toast.error('Network connectivity issues. Please check your connection.');
            setRetryCount(0);
          }
        }
        throw error;
      }
      
      // Reset retry counter on success
      setRetryCount(0);
      setOrders(data || []);
      console.log('Orders fetched:', data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription for orders
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('Orders change received:', payload);
        
        // Update the orders list based on the change
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [(payload.new as Order), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => 
            prev.map(order => 
              order.id === payload.new.id ? { 
                ...order, 
                ...payload.new as Order
              } : order
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(order => order.id !== payload.old.id));
        }
      })
      .subscribe((status) => {
        console.log('Orders subscription status:', status);
      });

    // Refresh orders periodically to ensure consistency
    const refreshInterval = setInterval(fetchOrders, 60000); // Every minute

    return () => {
      supabase.removeChannel(ordersSubscription);
      clearInterval(refreshInterval);
    };
  }, [retryCount]);

  const getOrdersByAgentId = (agentId: number) => {
    return orders.filter(order => order.agent_id === agentId);
  };

  // Since we don't have status in the schema, let's assume all orders are completed
  const getCompletedOrderCount = () => {
    return orders.length;
  };

  const getPendingOrderCount = () => {
    return 0; // No status in schema, so no pending orders
  };

  const getCancelledOrderCount = () => {
    return 0; // No status in schema, so no cancelled orders
  };

  const filterOrdersByDateRange = (range: 'hour' | 'today' | 'yesterday' | 'all') => {
    const now = new Date();
    
    if (range === 'all') {
      return orders;
    }
    
    if (range === 'hour') {
      const oneHourAgo = addHours(now, -1);
      return orders.filter(order => new Date(order.timestamp) >= oneHourAgo);
    }
    
    if (range === 'today') {
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      return orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= todayStart && orderDate <= todayEnd;
      });
    }
    
    if (range === 'yesterday') {
      const yesterdayStart = startOfDay(subDays(now, 1));
      const yesterdayEnd = endOfDay(subDays(now, 1));
      return orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= yesterdayStart && orderDate <= yesterdayEnd;
      });
    }
    
    return orders;
  };

  // Force refresh orders
  const refreshOrders = () => {
    fetchOrders();
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoadingOrders,
        getOrdersByAgentId,
        getCompletedOrderCount,
        getPendingOrderCount,
        getCancelledOrderCount,
        filterOrdersByDateRange,
        refreshOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

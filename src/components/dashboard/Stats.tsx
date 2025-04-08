
import { useOrder } from "@/contexts/OrderContext";
import { useAgent } from "@/contexts/AgentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ClipboardCheck, Users, XCircle, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { addDays, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StatsProps {
  showActiveAgentsAndCompletedOnly?: boolean;
  showChartOnly?: boolean;
}

export function Stats({ showActiveAgentsAndCompletedOnly, showChartOnly }: StatsProps) {
  const { getCompletedOrderCount, getPendingOrderCount, getCancelledOrderCount, isLoadingOrders, orders } = useOrder();
  const { agents, isLoading: isLoadingAgents } = useAgent();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');
  
  // Use effect to ensure we only show loading state on initial load
  useEffect(() => {
    if (!isLoadingOrders && !isLoadingAgents) {
      setIsInitialLoading(false);
    }
    
    // Set a minimum loading time to prevent flashing
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoadingOrders, isLoadingAgents]);
  
  const activeAgentCount = agents.filter(agent => agent.active).length;
  
  // Filter orders based on date range
  const getFilteredOrders = () => {
    const now = new Date();
    
    if (dateRange === 'all') {
      return orders;
    }
    
    if (dateRange === 'week') {
      const oneWeekAgo = addDays(now, -7);
      return orders.filter(order => new Date(order.timestamp) >= oneWeekAgo);
    }
    
    if (dateRange === 'month') {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      return orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return isWithinInterval(orderDate, { start: monthStart, end: monthEnd });
      });
    }
    
    return orders;
  };
  
  // Prepare chart data based on agent order counts
  const getChartData = () => {
    const filteredOrders = getFilteredOrders();
    return agents.map(agent => {
      const orderCount = filteredOrders.filter(order => order.agent_id === agent.id).length;
      return {
        name: agent.name,
        orders: orderCount,
      };
    }).filter(item => item.orders > 0); // Only show agents with orders
  };
  
  if (isInitialLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    );
  }
  
  // If we only want to show the Chart
  if (showChartOnly) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Orders by Agent</CardTitle>
          <div className="flex space-x-2">
            <Badge 
              variant={dateRange === 'week' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setDateRange('week')}
            >
              Last Week
            </Badge>
            <Badge 
              variant={dateRange === 'month' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setDateRange('month')}
            >
              This Month
            </Badge>
            <Badge 
              variant={dateRange === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setDateRange('all')}
            >
              All Time
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If we only want to show Active Agents and Completed Orders
  if (showActiveAgentsAndCompletedOnly) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgentCount}</div>
            <p className="text-xs text-muted-foreground">
              Out of {agents.length} total agents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletedOrderCount()}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Default: Show all stats
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeAgentCount}</div>
          <p className="text-xs text-muted-foreground">
            Out of {agents.length} total agents
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getPendingOrderCount()}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting processing
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getCompletedOrderCount()}</div>
          <p className="text-xs text-muted-foreground">
            Successfully processed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getCancelledOrderCount()}</div>
          <p className="text-xs text-muted-foreground">
            Unable to process
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrder } from "@/contexts/OrderContext";
import { useAgent } from "@/contexts/AgentContext";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

export function OrderHistory() {
  const { orders, isLoadingOrders, filterOrdersByDateRange } = useOrder();
  const { agents } = useAgent();
  const [selectedDateRange, setSelectedDateRange] = useState<'hour' | 'today' | 'yesterday' | 'all'>('all');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 orders per page
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);
  
  // Update filtered orders when selection changes
  useEffect(() => {
    const filtered = filterOrdersByDateRange(selectedDateRange);
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedDateRange, orders, filterOrdersByDateRange]);
  
  // Update pagination when filtered orders change
  useEffect(() => {
    const total = Math.ceil(filteredOrders.length / itemsPerPage);
    setTotalPages(total || 1); // Ensure at least 1 page even if empty
    
    // Get current page of orders
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedOrders(filteredOrders.slice(startIndex, endIndex));
  }, [filteredOrders, currentPage, itemsPerPage]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const getAgentName = (agentId: number): string => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };
  
  const getAgentInitials = (agentId: number): string => {
    const name = getAgentName(agentId);
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getColorForAgent = (agentId: number): string => {
    // Simple hash function to generate a consistent color based on agent ID
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    return colors[agentId % colors.length];
  };
  
  // Prepare data for the chart
  const chartData = agents.map(agent => {
    const orderCount = orders.filter(order => order.agent_id === agent.id).length;
    return {
      name: agent.name,
      orders: orderCount,
    };
  });
  
  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
      
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if it's not the first page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  if (isLoadingOrders) {
    return (
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Loading order history...</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          View recent orders and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Order List</TabsTrigger>
            <TabsTrigger value="stats">Order Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <div className="space-x-2 mb-4">
              <Badge 
                variant={selectedDateRange === 'hour' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedDateRange('hour')}
              >
                Last Hour
              </Badge>
              <Badge 
                variant={selectedDateRange === 'today' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedDateRange('today')}
              >
                Today
              </Badge>
              <Badge 
                variant={selectedDateRange === 'yesterday' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedDateRange('yesterday')}
              >
                Yesterday
              </Badge>
              <Badge 
                variant={selectedDateRange === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedDateRange('all')}
              >
                All Time
              </Badge>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders found for the selected time period.
              </div>
            ) : (
              <>
                <ScrollArea className="h-[370px]">
                  <div className="space-y-3">
                    {paginatedOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="flex items-center p-3 bg-background rounded-lg border animate-fade-in"
                      >
                        <Avatar className={`mr-3 ${getColorForAgent(order.agent_id)}`}>
                          <AvatarFallback>
                            {getAgentInitials(order.agent_id)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col flex-1">
                          <div className="font-medium">
                            {getAgentName(order.agent_id)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Order #{order.id} • {formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="ml-auto">
                          Completed
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Orders by Agent</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orders.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm">Orders Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filterOrdersByDateRange('today').length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm">Active Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{agents.filter(a => a.active).length}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

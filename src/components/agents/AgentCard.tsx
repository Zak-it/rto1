
import { Agent } from "@/types";
import { useAgent } from "@/contexts/AgentContext";
import { useOrder } from "@/contexts/OrderContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, UserRound } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { COLORS } from "@/types";

interface AgentCardProps {
  agent: Agent;
  isCurrentTurn: boolean;
  isRecentlyChanged?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AgentCard({ 
  agent, 
  isCurrentTurn, 
  isRecentlyChanged,
  style, 
  className 
}: AgentCardProps) {
  const { currentUserAgent, toggleAgentActive } = useAgent();
  const { getOrdersByAgentId } = useOrder();
  const [isToggling, setIsToggling] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  
  const isSelected = currentUserAgent?.id === agent.id;
  
  // Get updated order count whenever orders change
  useEffect(() => {
    const agentOrders = getOrdersByAgentId(agent.id);
    setOrderCount(agentOrders.length);
  }, [getOrdersByAgentId, agent.id]);
  
  const handleToggleActive = async () => {
    setIsToggling(true);
    await toggleAgentActive(agent.id, !agent.active);
    setIsToggling(false);
  };
  
  return (
    <Card 
      className={cn(
        "transition-all duration-500 border-2",
        isCurrentTurn ? "border-queue-active shadow-md shadow-queue-active/20" : 
          isSelected ? "border-user-badge shadow-md shadow-user-badge/20" : "border-transparent",
        isCurrentTurn && isRecentlyChanged && "animate-pulse-highlight",
        className
      )}
      style={style}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className={cn(
                "p-2 rounded-full",
                isSelected ? "bg-user-badge/10" : "bg-secondary",
                isCurrentTurn && "bg-queue-active/10"
              )}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: isRecentlyChanged ? [1, 1.2, 1] : 1,
                transition: { 
                  duration: isRecentlyChanged ? 0.5 : 0.2,
                  repeat: isRecentlyChanged ? 1 : 0,
                  repeatType: "reverse"
                }
              }}
            >
              <UserRound className={cn(
                "h-5 w-5",
                isSelected ? "text-user-badge" : "text-muted-foreground",
                isCurrentTurn && "text-queue-active"
              )} />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={cn(
                  "font-medium",
                  isCurrentTurn && "text-queue-active",
                  isSelected && !isCurrentTurn && "text-user-badge"
                )}>
                  {agent.name}
                </h3>
                {isCurrentTurn && (
                  <Badge variant="outline" className="bg-queue-active/10 text-queue-active border-queue-active">
                    Current Turn
                  </Badge>
                )}
                {!agent.active && (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Inactive
                  </Badge>
                )}
                {isSelected && (
                  <Badge variant="outline" className="bg-user-badge/10 text-user-badge border-user-badge">
                    You
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {orderCount} order{orderCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch 
                    checked={!!agent.active} 
                    onCheckedChange={handleToggleActive}
                    disabled={isToggling}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {agent.active ? "Deactivate agent" : "Activate agent"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {agent.active && isCurrentTurn && (
          <motion.div 
            className="mt-4 p-2 rounded-lg bg-queue-active/5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.2 }
            }}
          >
            <div className="flex items-center justify-center text-xs text-queue-active font-medium">
              <Clock className="h-3 w-3 mr-1" /> Current Turn
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

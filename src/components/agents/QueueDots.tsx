
import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QueueDotsProps {
  totalAgents: number;
  currentPosition: number;
  className?: string;
  showLabel?: boolean;
  agentNames?: { id: number; name: string }[];
  currentAgentId?: number | null;
}

export function QueueDots({ 
  totalAgents, 
  currentPosition, 
  className, 
  showLabel = false,
  agentNames = [],
  currentAgentId = null
}: QueueDotsProps) {
  // Ensure valid positions
  const validTotal = Math.max(1, totalAgents);
  const validPosition = Math.min(Math.max(0, currentPosition), validTotal - 1);
  
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} 
      aria-label={`Queue position ${validPosition + 1} of ${validTotal}`}>
      <TooltipProvider>
        <div className="flex items-center space-x-3">
          {agentNames.map((agent, index) => {
            // Determine dot states based on agent's position in queue
            const isActive = index === validPosition; // First agent in queue is current turn
            const isCurrentAgent = currentAgentId && agent.id === currentAgentId;
            
            // Determine tooltip text based on position state
            let tooltipText = agent.name;
            if (isActive) {
              tooltipText = `Current Turn: ${agent.name}`;
            }
            if (isCurrentAgent) {
              tooltipText += " (You)";
            }
            
            // ARIA label for accessibility
            const ariaLabel = isActive 
              ? `Current turn: ${agent.name}` 
              : `Position ${index + 1}: ${agent.name}`;
            
            return (
              <Tooltip key={agent.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "relative rounded-full transition-all duration-300",
                      isActive && "animate-pulse",
                      isActive 
                        ? "bg-queue-active" 
                        : isCurrentAgent 
                          ? "bg-user-badge" 
                          : "bg-queue-waiting/30",
                      // Special case: current agent has current turn (blue with green ring)
                      isActive && isCurrentAgent && "ring-2 ring-user-badge ring-offset-1 ring-offset-background",
                      // Only current user gets ring when not active
                      !isActive && isCurrentAgent && "ring-2 ring-user-badge ring-offset-1 ring-offset-background"
                    )}
                    style={{
                      width: "12px",
                      height: "12px"
                    }}
                    aria-label={ariaLabel}
                    role="status"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className={cn(
                  "px-2 py-1 text-xs font-medium",
                  isActive && "bg-queue-active text-white",
                  isCurrentAgent && !isActive && "bg-user-badge text-white"
                )}>
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      
      {showLabel && validTotal > 1 && currentAgentId && (
        <div className="ml-3 text-sm bg-secondary px-2 py-0.5 rounded-full font-medium">
          {currentAgentId && (
            <>
              <span className="text-user-badge">
                {agentNames.findIndex(a => a.id === currentAgentId) + 1}
              </span>
              <span className="text-muted-foreground">/{validTotal}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

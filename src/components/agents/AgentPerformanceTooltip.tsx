
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, SkipForward, AlertTriangle } from "lucide-react";
import { Agent } from "@/types";

interface AgentPerformanceTooltipProps {
  agent: Agent;
  children: React.ReactNode;
}

export function AgentPerformanceTooltip({ agent, children }: AgentPerformanceTooltipProps) {
  // Format time in seconds to a friendly string
  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return "N/A";
    
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="w-64 p-3" side="right">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Agent Performance</h4>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Avg. Completion Time:</span>
                </div>
                <span className="font-medium">
                  {formatTime(agent.average_completion_time)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <SkipForward className="h-3 w-3" />
                  <span>Skipped Turns:</span>
                </div>
                <span className="font-medium">
                  {agent.turn_skips !== undefined ? agent.turn_skips : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Response Delay:</span>
                </div>
                <span className="font-medium">
                  {formatTime(agent.response_delay)}
                </span>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              {agent.order_count || 0} order{agent.order_count !== 1 ? 's' : ''} completed
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


import { Agent } from "@/types";
import { QueueDots } from "./QueueDots";

interface QueueStatusProps {
  orderedQueueAgents: Agent[];
  currentAgentId: number | null;
  currentUserAgentId: number | null;
}

export function QueueStatus({ 
  orderedQueueAgents, 
  currentAgentId, 
  currentUserAgentId 
}: QueueStatusProps) {
  if (!orderedQueueAgents.length) return null;
  
  return (
    <div className="mb-6 p-3 bg-muted/30 rounded-lg">
      <div className="mb-2 text-sm font-medium text-muted-foreground">Queue Status</div>
      <QueueDots 
        totalAgents={orderedQueueAgents.length} 
        currentPosition={0} // Current agent is always first in our ordered list
        currentAgentId={currentUserAgentId}
        agentNames={orderedQueueAgents.map(a => ({ id: a.id, name: a.name }))}
        showLabel={true}
        className="py-2"
      />
    </div>
  );
}

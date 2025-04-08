
import { useAgent } from "@/contexts/AgentContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { QueueHeader } from "./QueueHeader";
import { AgentQueueList } from "./AgentQueueList";
import { EmptyAgentQueue } from "./EmptyAgentQueue";

export function QueueBoard() {
  const { agents, currentAgentId, isLoading, addAgent, currentUserAgent } = useAgent();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prevCurrentAgentId, setPrevCurrentAgentId] = useState<number | null>(null);
  
  // Check for notification permission
  useEffect(() => {
    setNotificationsEnabled(Notification.permission === 'granted');
  }, []);
  
  // Use effect to ensure we only show loading state on initial load
  useEffect(() => {
    if (!isLoading) {
      setIsInitialLoading(false);
    }
    
    // Set a minimum loading time to prevent flashing
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Track changes in the current agent for animations
  useEffect(() => {
    setPrevCurrentAgentId(currentAgentId);
  }, [currentAgentId]);
  
  // Get active and inactive agents
  const activeAgents = agents.filter(agent => agent.active);
  const inactiveAgents = agents.filter(agent => !agent.active);
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  };
  
  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Agent Queue</h2>
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <QueueHeader 
        activeAgentCount={activeAgents.length}
        onAddAgent={addAgent}
        notificationsEnabled={notificationsEnabled}
        onRequestNotificationPermission={requestNotificationPermission}
      />
      
      {activeAgents.length === 0 ? (
        <EmptyAgentQueue onAddAgent={() => setDialogOpen(true)} />
      ) : (
        <AgentQueueList 
          activeAgents={activeAgents}
          inactiveAgents={inactiveAgents}
          currentAgentId={currentAgentId}
          prevCurrentAgentId={prevCurrentAgentId}
        />
      )}
    </div>
  );
}

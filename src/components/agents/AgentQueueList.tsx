
import { Agent } from "@/types";
import { AgentCard } from "./AgentCard";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentQueueListProps {
  activeAgents: Agent[];
  inactiveAgents: Agent[];
  currentAgentId: number | null;
  prevCurrentAgentId?: number | null;
}

export function AgentQueueList({ 
  activeAgents, 
  inactiveAgents, 
  currentAgentId,
  prevCurrentAgentId
}: AgentQueueListProps) {
  const prevActiveAgentsRef = useRef<Agent[]>([]);
  const [recentlyChanged, setRecentlyChanged] = useState<number | null>(null);
  
  // Track when the current agent changes to add special animation
  useEffect(() => {
    if (prevActiveAgentsRef.current.length > 0 && currentAgentId) {
      // If current agent has changed
      if (prevCurrentAgentId !== currentAgentId) {
        setRecentlyChanged(currentAgentId);
        
        // Clear the highlight after animation completes
        const timer = setTimeout(() => {
          setRecentlyChanged(null);
        }, 2000); // Match this with animation duration
        
        return () => clearTimeout(timer);
      }
    }
    
    // Update ref for next comparison
    prevActiveAgentsRef.current = activeAgents;
  }, [activeAgents, currentAgentId, prevCurrentAgentId]);
  
  return (
    <div className="space-y-3">
      {/* Display active agents with animations in their original order */}
      <div className="space-y-3 relative">
        <AnimatePresence initial={false}>
          {activeAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  delay: index * 0.05 
                }
              }}
              exit={{ 
                opacity: 0, 
                y: -20,
                transition: { duration: 0.2 } 
              }}
              layout
              layoutId={`agent-${agent.id}`}
              className="w-full"
            >
              <AgentCard
                agent={agent}
                isCurrentTurn={agent.id === currentAgentId}
                isRecentlyChanged={agent.id === recentlyChanged}
                className={cn(
                  "transition-transform duration-300"
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Display inactive agents */}
      {inactiveAgents.length > 0 && (
        <div className="pt-2 mt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Inactive Agents</h3>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {inactiveAgents.map(agent => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      type: "spring", 
                      stiffness: 100, 
                      damping: 15 
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8,
                    transition: { duration: 0.2 } 
                  }}
                  layout
                >
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isCurrentTurn={false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

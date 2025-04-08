
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type MultiTabGuardOptions = {
  agentId: number | null;
  onDetectDuplicate?: () => void;
  onTabClose?: () => void;
};

export const useMultiTabGuard = ({
  agentId,
  onDetectDuplicate,
  onTabClose
}: MultiTabGuardOptions) => {
  const [isDuplicateTab, setIsDuplicateTab] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);
  
  // Generate a unique tab ID on mount
  const [tabId] = useState(() => `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  
  // Set up broadcast channel for inter-tab communication
  useEffect(() => {
    if (!agentId) return;
    
    // Only set up when we have an agent ID
    const channelName = `haifa_rto_agent_${agentId}`;
    const localStorageKey = `haifa_rto_agent_${agentId}_active_tab`;
    
    try {
      const channel = new BroadcastChannel(channelName);
      setBroadcastChannel(channel);
      
      // Check if another tab is already active
      const activeTabId = localStorage.getItem(localStorageKey);
      if (activeTabId && activeTabId !== tabId) {
        setIsDuplicateTab(true);
        
        // Notify that this is a duplicate tab
        if (onDetectDuplicate) {
          onDetectDuplicate();
        }
        
        toast.error("This agent is already active in another tab", {
          description: "Please use the original tab for this agent",
          duration: 10000
        });
      } else {
        // Set this tab as the active one
        localStorage.setItem(localStorageKey, tabId);
      }
      
      // Handle messages from other tabs
      channel.onmessage = (event) => {
        if (event.data.type === 'TAB_CHECK' && event.data.tabId !== tabId) {
          // Respond that this tab is active
          channel.postMessage({
            type: 'TAB_ACTIVE',
            tabId,
            timestamp: Date.now()
          });
        } else if (event.data.type === 'TAB_ACTIVE' && event.data.tabId !== tabId) {
          // Another tab is active, check if it was created after this one
          const currentTabTimestamp = parseInt(tabId.split('_')[1]);
          if (event.data.timestamp && event.data.timestamp > currentTabTimestamp) {
            // This is an older tab, mark as duplicate
            setIsDuplicateTab(true);
            
            if (onDetectDuplicate) {
              onDetectDuplicate();
            }
            
            toast.error("This agent is now active in another tab", {
              description: "Please continue in the newer tab",
              duration: 10000
            });
          }
        }
      };
      
      // Broadcast that this tab is active
      channel.postMessage({
        type: 'TAB_CHECK',
        tabId,
        timestamp: Date.now()
      });
      
      // Set up beforeunload event to clean up
      const handleBeforeUnload = () => {
        // Only clean up if this is the active tab
        if (localStorage.getItem(localStorageKey) === tabId) {
          localStorage.removeItem(localStorageKey);
          
          // Notify that this tab is closing
          channel.postMessage({
            type: 'TAB_CLOSED',
            tabId,
            timestamp: Date.now()
          });
          
          if (onTabClose) {
            onTabClose();
          }
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Ping periodically to ensure this tab is still recognized as active
      const pingInterval = setInterval(() => {
        if (localStorage.getItem(localStorageKey) === tabId && !isDuplicateTab) {
          localStorage.setItem(localStorageKey, tabId);
          channel.postMessage({
            type: 'TAB_ACTIVE',
            tabId,
            timestamp: Date.now()
          });
        }
      }, 5000);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        clearInterval(pingInterval);
        channel.close();
        
        // Clean up localStorage if this is the active tab
        if (localStorage.getItem(localStorageKey) === tabId) {
          localStorage.removeItem(localStorageKey);
        }
      };
    } catch (error) {
      console.error('Failed to set up multi-tab detection:', error);
      // Fallback to allowing all tabs if BroadcastChannel isn't supported
      return;
    }
  }, [agentId, tabId, isDuplicateTab, onDetectDuplicate, onTabClose]);
  
  return {
    isDuplicateTab,
    tabId,
    broadcastChannel
  };
};

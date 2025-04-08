
import { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAgent } from '@/contexts/AgentContext';
import { toast } from 'sonner';
import { useTurnNotification } from '@/hooks/useTurnNotification';
import { initializeNotificationSound, requestNotificationPermission } from '@/utils/notificationUtils';
import { useMultiTabGuard } from '@/hooks/useMultiTabGuard';
import { MultiTabWarningModal } from '@/components/agents/MultiTabWarningModal';
import { AdminControls } from '@/components/agents/AdminControls';

const Index = () => {
  const { currentAgentId, currentUserAgent, advanceTurn, toggleAgentActive } = useAgent();
  const isMyTurn = currentUserAgent?.id === currentAgentId;
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // Initialize notification sounds on page load
  useEffect(() => {
    initializeNotificationSound();
  }, []);
  
  // Use our custom hook for turn notifications
  const { requestPermission } = useTurnNotification({
    isMyTurn,
    agentName: currentUserAgent?.name,
    turnTimeLimit: 120 // 2 minutes per turn
  });
  
  // Handle multi-tab detection
  const { isDuplicateTab } = useMultiTabGuard({
    agentId: currentUserAgent?.id || null,
    onTabClose: async () => {
      // If this was the active tab and it's the current agent's turn, advance the turn
      if (currentUserAgent && currentAgentId === currentUserAgent.id) {
        console.log("Tab closing while it was this agent's turn, advancing turn");
        try {
          // Auto-skip turn and mark agent as inactive
          if (currentUserAgent) {
            await toggleAgentActive(currentUserAgent.id, false);
          }
          await advanceTurn();
        } catch (error) {
          console.error("Failed to auto-advance turn on tab close:", error);
        }
      }
    }
  });
  
  // Request notification permission on page load
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      requestNotificationPermission().then(permission => {
        if (permission === 'granted') {
          toast.success('Desktop notifications enabled', {
            icon: <img 
              src="/lovable-uploads/3425fca3-90da-40b2-97f6-bcabe242d2b2.png" 
              alt="notification" 
              className="w-6 h-6" 
            />
          });
        }
      });
    }
    
    // Update page title with site name
    document.title = "Haifa RTO - Agent Queue System";
    
    // Check for admin controls keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Shift+A to toggle admin controls
      if (e.altKey && e.shiftKey && e.key === 'A') {
        setShowAdminControls(prev => !prev);
        toast.info(showAdminControls ? 'Admin controls hidden' : 'Admin controls visible');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdminControls]);

  return (
    <>
      <DashboardLayout />
      <MultiTabWarningModal 
        isOpen={isDuplicateTab} 
        onClose={() => {}}
      />
      
      {/* Admin controls panel that appears when activated */}
      {showAdminControls && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <AdminControls />
        </div>
      )}
    </>
  );
};

export default Index;

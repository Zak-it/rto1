
import { useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAgent } from '@/contexts/AgentContext';
import { toast } from 'sonner';
import { useTurnNotification } from '@/hooks/useTurnNotification';
import { initializeNotificationSound, requestNotificationPermission } from '@/utils/notificationUtils';

const Index = () => {
  const { currentAgentId, currentUserAgent } = useAgent();
  const isMyTurn = currentUserAgent?.id === currentAgentId;
  
  // Initialize notification sounds on page load
  useEffect(() => {
    initializeNotificationSound();
  }, []);
  
  // Use our custom hook for turn notifications
  const { requestPermission } = useTurnNotification({
    isMyTurn,
    agentName: currentUserAgent?.name
  });
  
  // Request notification permission on page load
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      requestNotificationPermission().then(permission => {
        if (permission === 'granted') {
          toast.success('Desktop notifications enabled', {
            icon: <img src="/favicon.ico" alt="notification" className="w-6 h-6" />
          });
        }
      });
    }
    
    // Update page title with site name
    document.title = "Haifa RTO - Agent Queue System";
  }, []);

  return <DashboardLayout />;
};

export default Index;

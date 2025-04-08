
import { useEffect, useRef, useState } from 'react';
import { 
  requestNotificationPermission, 
  sendNotification, 
  playNotificationSound 
} from '@/utils/notificationUtils';

type TurnNotificationProps = {
  isMyTurn: boolean;
  agentName?: string;
  turnTimeLimit?: number; // New prop for countdown timer
};

export const useTurnNotification = ({ 
  isMyTurn, 
  agentName,
  turnTimeLimit = 120 // Default time limit in seconds
}: TurnNotificationProps) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const notificationIntervalRef = useRef<number | null>(null);
  const previousTurnRef = useRef(isMyTurn);
  const originalTitleRef = useRef(document.title);

  // Request notification permission
  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    return permission;
  };

  // Update tab title to indicate it's the agent's turn
  const updateTabTitle = (isActive: boolean) => {
    if (isActive) {
      document.title = `(Your Turn) - Haifa RTO`;
    } else {
      document.title = originalTitleRef.current;
    }
  };

  // Send immediate notification and start interval for repeated notifications
  const startTurnNotifications = () => {
    // Initial notification and sound
    const notificationTitle = `📢 Haifa RTO: It's Your Turn Now!`;
    const notificationBody = `You can now submit an order in the queue system`;
    
    sendNotification(notificationTitle, {
      body: notificationBody,
      tag: 'turn-notification',
      icon: '/lovable-uploads/3425fca3-90da-40b2-97f6-bcabe242d2b2.png'
    });
    
    playNotificationSound();
    
    // Update tab title
    updateTabTitle(true);
    
    // Set up interval for repeated notifications every 30 seconds
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    
    notificationIntervalRef.current = window.setInterval(() => {
      // Send reminder notification with agent name if available
      const reminderTitle = `⏰ Haifa RTO Reminder: Still Your Turn!`;
      const reminderBody = agentName 
        ? `${agentName}, you can submit an order now`
        : `You can submit an order now`;
      
      sendNotification(reminderTitle, {
        body: reminderBody,
        tag: 'turn-reminder',
        icon: '/lovable-uploads/3425fca3-90da-40b2-97f6-bcabe242d2b2.png'
      });
      
      playNotificationSound();
    }, 30000); // 30 seconds
  };

  // Stop the notification interval
  const stopTurnNotifications = () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
    
    // Reset tab title
    updateTabTitle(false);
  };

  // Main effect to handle turn changes
  useEffect(() => {
    // Save original title on mount
    originalTitleRef.current = document.title;
    
    // Only proceed if we have notification permission
    if (notificationPermission === 'granted') {
      // If turn has changed to the user's turn, start notifications
      if (isMyTurn && !previousTurnRef.current) {
        startTurnNotifications();
      } 
      // If turn has changed away from the user's turn, stop notifications
      else if (!isMyTurn && previousTurnRef.current) {
        stopTurnNotifications();
      }
    }
    
    // Update previous turn reference
    previousTurnRef.current = isMyTurn;
    
    // Always update tab title even if notification permission is not granted
    updateTabTitle(isMyTurn);
    
    // Clean up on unmount
    return () => {
      stopTurnNotifications();
    };
  }, [isMyTurn, notificationPermission, agentName]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
      // Restore original title
      document.title = originalTitleRef.current;
    };
  }, []);

  return {
    notificationPermission,
    requestPermission
  };
};

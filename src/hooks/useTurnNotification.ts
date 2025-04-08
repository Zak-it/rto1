
import { useEffect, useRef, useState } from 'react';
import { 
  requestNotificationPermission, 
  sendNotification, 
  playNotificationSound 
} from '@/utils/notificationUtils';

type TurnNotificationProps = {
  isMyTurn: boolean;
  agentName?: string;
};

export const useTurnNotification = ({ isMyTurn, agentName }: TurnNotificationProps) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const notificationIntervalRef = useRef<number | null>(null);
  const previousTurnRef = useRef(isMyTurn);

  // Request notification permission
  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    return permission;
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
  };

  // Main effect to handle turn changes
  useEffect(() => {
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
    };
  }, []);

  return {
    notificationPermission,
    requestPermission
  };
};

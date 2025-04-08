
// Notification utilities for the agent queue system

let notificationSound: HTMLAudioElement | null = null;

/**
 * Initialize the notification sound element
 */
export const initializeNotificationSound = () => {
  if (!notificationSound) {
    notificationSound = new Audio('/notification.mp3');
    notificationSound.preload = 'auto';
  }
};

/**
 * Play the notification sound once
 */
export const playNotificationSound = () => {
  if (!notificationSound) {
    initializeNotificationSound();
  }
  
  // Reset the sound to the beginning if it's already playing
  if (notificationSound) {
    notificationSound.pause();
    notificationSound.currentTime = 0;
    notificationSound.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
};

/**
 * Request permission for browser notifications
 * @returns A promise that resolves to the notification permission state
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
};

/**
 * Send a browser notification
 * @param title Notification title
 * @param options Notification options
 */
export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/lovable-uploads/3425fca3-90da-40b2-97f6-bcabe242d2b2.png', // Using the flame icon
      badge: '/lovable-uploads/3425fca3-90da-40b2-97f6-bcabe242d2b2.png',
      requireInteraction: true,
      ...options
    });
    
    return notification;
  }
  
  return null;
};


import { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
  className?: string;
}

export function CountdownTimer({
  duration,
  onTimeUp,
  isActive,
  className
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  
  // Calculate percentage of time remaining
  const progressPercentage = Math.max(0, (timeRemaining / duration) * 100);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine color based on time remaining
  const getColorClass = () => {
    if (progressPercentage > 50) return 'text-green-500';
    if (progressPercentage > 25) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Start/stop timer based on active state
  useEffect(() => {
    if (isActive) {
      setTimeRemaining(duration);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [isActive, duration]);
  
  // Countdown timer logic
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, onTimeUp]);
  
  if (!isActive) return null;
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 animate-pulse" fill={progressPercentage > 25 ? "currentColor" : "red"} />
          <span className="text-sm font-medium">Time Remaining</span>
        </div>
        <span className={cn("text-sm font-bold", getColorClass())}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2"
        indicatorClassName={cn(
          progressPercentage > 50 ? "bg-green-500" : 
          progressPercentage > 25 ? "bg-amber-500" : 
          "bg-red-500"
        )}
      />
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";

interface NotificationButtonProps {
  enabled: boolean;
  onRequestPermission: () => void;
}

export function NotificationButton({ 
  enabled, 
  onRequestPermission 
}: NotificationButtonProps) {
  if (enabled) return null;
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onRequestPermission}
      className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
    >
      <BellRing className="h-4 w-4 mr-2" />
      Enable Notifications
    </Button>
  );
}

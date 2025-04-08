
import { Users, BellRing } from "lucide-react";
import { AddAgentDialog } from "./AddAgentDialog";
import { NotificationButton } from "./NotificationButton";

interface QueueHeaderProps {
  activeAgentCount: number;
  onAddAgent: (name: string) => Promise<void>;
  notificationsEnabled: boolean;
  onRequestNotificationPermission: () => void;
}

export function QueueHeader({
  activeAgentCount,
  onAddAgent,
  notificationsEnabled,
  onRequestNotificationPermission
}: QueueHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Haifa RTO Queue</h2>
        <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1">
          <Users className="h-3 w-3" />
          {activeAgentCount}
        </div>
      </div>
      <div className="flex space-x-2">
        <AddAgentDialog onAddAgent={onAddAgent} />
        <NotificationButton 
          enabled={notificationsEnabled} 
          onRequestPermission={onRequestNotificationPermission} 
        />
      </div>
    </div>
  );
}

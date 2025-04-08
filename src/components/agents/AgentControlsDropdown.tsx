
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  SkipForward, 
  PauseCircle,
  PlayCircle,
  Bell
} from "lucide-react";
import { Agent } from "@/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AgentControlsDropdownProps {
  agent: Agent;
  isCurrentTurn: boolean;
  onSkipTurn: (agentId: number) => Promise<void>;
  onFreeze: (agentId: number, frozen: boolean) => Promise<void>;
  onNotify: (agentId: number, message: string) => Promise<void>;
}

export function AgentControlsDropdown({
  agent,
  isCurrentTurn,
  onSkipTurn,
  onFreeze,
  onNotify
}: AgentControlsDropdownProps) {
  const [isSkipping, setIsSkipping] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  
  const isFrozen = agent.status === 'frozen';
  
  const handleSkipTurn = async () => {
    if (!isCurrentTurn) {
      toast.error("Can only skip the current agent's turn");
      return;
    }
    
    setIsSkipping(true);
    try {
      await onSkipTurn(agent.id);
      toast.success(`Skipped ${agent.name}'s turn`);
    } catch (error) {
      console.error("Failed to skip turn:", error);
      toast.error("Failed to skip turn");
    } finally {
      setIsSkipping(false);
    }
  };
  
  const handleFreeze = async () => {
    setIsFreezing(true);
    try {
      await onFreeze(agent.id, !isFrozen);
      toast.success(isFrozen 
        ? `Unfrozen agent ${agent.name}` 
        : `Frozen agent ${agent.name}`
      );
    } catch (error) {
      console.error("Failed to toggle freeze:", error);
      toast.error(`Failed to ${isFrozen ? 'unfreeze' : 'freeze'} agent`);
    } finally {
      setIsFreezing(false);
    }
  };
  
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast.error("Please enter a message to send");
      return;
    }
    
    try {
      await onNotify(agent.id, notificationMessage);
      toast.success(`Notification sent to ${agent.name}`);
      setNotificationMessage("");
      setIsNotifyDialogOpen(false);
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast.error("Failed to send notification");
    }
  };
  
  return (
    <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isCurrentTurn && (
            <DropdownMenuItem
              onClick={handleSkipTurn}
              disabled={isSkipping}
              className="cursor-pointer"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Turn
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem
            onClick={handleFreeze}
            disabled={isFreezing}
            className="cursor-pointer"
          >
            {isFrozen ? (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Unfreeze Agent
              </>
            ) : (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                Freeze Agent
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DialogTrigger asChild>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Notification
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Notification to {agent.name}</DialogTitle>
          <DialogDescription>
            The agent will receive a popup notification with your message.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Notification Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsNotifyDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSendNotification}>
            Send Notification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

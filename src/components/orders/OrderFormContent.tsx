
import { useEffect, MutableRefObject } from "react";
import { CardContent } from "@/components/ui/card";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QueueDots } from "@/components/agents/QueueDots";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountdownTimer } from "./CountdownTimer";
import { useMultiTabGuard } from "@/hooks/useMultiTabGuard";
import { useAgent } from "@/contexts/AgentContext";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface OrderFormContentProps {
  isCurrentUserTurn: boolean;
  errorMessage: string | null;
  orderId: string;
  setOrderId: (id: string) => void;
  setIsEditing: (editing: boolean) => void;
  isSubmitting: boolean;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  previousTurnState: MutableRefObject<boolean>;
}

export function OrderFormContent({
  isCurrentUserTurn,
  errorMessage,
  orderId,
  setOrderId,
  setIsEditing,
  isSubmitting,
  inputRef,
  previousTurnState
}: OrderFormContentProps) {
  const { agents, currentAgentId, currentUserAgent, advanceTurn } = useAgent();
  
  // Configure turn time limit in seconds (2 minutes default)
  const TURN_TIME_LIMIT = 120;

  // Check for multi-tab usage
  const { isDuplicateTab } = useMultiTabGuard({
    agentId: currentUserAgent?.id || null,
    onDetectDuplicate: () => {
      // Handled by showing the duplicate tab alert
    },
    onTabClose: () => {
      console.log("Tab closing, agent will be marked as inactive if needed");
    }
  });

  // When turn changes to the current user, focus the input field
  useEffect(() => {
    if (isCurrentUserTurn && !previousTurnState.current) {
      console.log("It's now your turn");
      // Focus the input field if it's the user's turn
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Show notification when it's the user's turn
      toast.info("It's your turn now!", {
        description: "You can now submit an order"
      });
    }
    previousTurnState.current = isCurrentUserTurn;
  }, [isCurrentUserTurn, previousTurnState]);

  // Handle countdown timer expiration
  const handleTimeUp = async () => {
    if (isCurrentUserTurn && currentUserAgent) {
      toast.warning("Time is up!", {
        description: "Your turn has been automatically skipped",
        duration: 5000
      });
      
      try {
        // Advance to the next agent's turn
        await advanceTurn();
      } catch (error) {
        console.error("Failed to auto-advance turn:", error);
        toast.error("Failed to advance turn automatically");
      }
    }
  };

  // Calculate current position for queue visualization
  const activeAgents = agents.filter(agent => agent.active);
  const currentPosition = activeAgents.findIndex(agent => agent.id === currentAgentId);

  return (
    <CardContent className="space-y-4">
      <QueueVisualization 
        activeAgents={activeAgents}
        currentPosition={currentPosition}
        currentAgentId={currentUserAgent?.id || null}
        isCurrentUserTurn={isCurrentUserTurn}
      />
      
      {isCurrentUserTurn && (
        <CountdownTimer 
          duration={TURN_TIME_LIMIT}
          onTimeUp={handleTimeUp}
          isActive={isCurrentUserTurn && !isDuplicateTab}
          className="mb-4"
        />
      )}
      
      {!isCurrentUserTurn && (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertTitle>Waiting for your turn</AlertTitle>
          <AlertDescription>
            You'll need to wait for your turn to submit an order.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {isDuplicateTab && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Multiple Tabs Detected</AlertTitle>
          <AlertDescription>
            This agent is already active in another tab. Please use that tab instead.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="orderId">Order ID</Label>
          <Input
            id="orderId"
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value);
              setIsEditing(true);
            }}
            disabled={!isCurrentUserTurn || isSubmitting || isDuplicateTab}
            className="mt-1"
            ref={inputRef}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the Order ID to process this submission
          </p>
        </div>
        
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm mb-2">Ready to submit your order?</p>
          <p className="font-medium">Enter an Order ID and click the button below when it's your turn</p>
        </div>
      </div>
    </CardContent>
  );
}

interface QueueVisualizationProps {
  activeAgents: any[];
  currentPosition: number;
  currentAgentId: number | null;
  isCurrentUserTurn: boolean;
}

function QueueVisualization({ 
  activeAgents, 
  currentPosition, 
  currentAgentId, 
  isCurrentUserTurn 
}: QueueVisualizationProps) {
  if (activeAgents.length === 0) return null;
  
  return (
    <div className="mb-6 p-4 bg-background rounded-lg border">
      <h4 className="text-sm font-medium mb-4 text-center">Agent Queue Status</h4>
      
      <QueueDots 
        totalAgents={activeAgents.length} 
        currentPosition={currentPosition}
        agentNames={activeAgents.map(a => ({ id: a.id, name: a.name }))}
        currentAgentId={currentAgentId}
        className="mx-auto mb-4" 
      />
      
      <div className="text-center text-sm">
        {isCurrentUserTurn ? (
          <div className="text-queue-active font-medium animate-pulse">
            It's your turn now!
          </div>
        ) : (
          <div className="text-muted-foreground">
            Waiting for your turn...
          </div>
        )}
      </div>
    </div>
  );
}

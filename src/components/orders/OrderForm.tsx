
import { useAgent } from "@/contexts/AgentContext";
import { useOrder } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { AlertCircle, Clock, SendHorizonal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueDots } from "@/components/agents/QueueDots";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function OrderForm() {
  const { currentUserAgent, isCurrentUserTurn, submitOrder, agents, currentAgentId } = useAgent();
  const { refreshOrders } = useOrder();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState("");
  
  // Track when the user is actively editing to prevent real-time updates from resetting the input
  const [isEditing, setIsEditing] = useState(false);
  const previousTurnState = useRef(isCurrentUserTurn);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Only reset form when user or agent changes, not on every render
  useEffect(() => {
    console.log("User or agent changed, resetting form");
    setErrorMessage(null);
    setOrderId("");
  }, [user?.id, currentUserAgent?.id]);
  
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
  }, [isCurrentUserTurn]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      console.log("Submitting order");
      console.log("Current user agent:", currentUserAgent);
      console.log("Is current user turn:", isCurrentUserTurn);
      console.log("Order ID:", orderId);
      
      if (!currentUserAgent) {
        throw new Error("No agent selected. Please refresh the page.");
      }
      
      if (!isCurrentUserTurn) {
        throw new Error("It's not your turn yet. Please wait.");
      }
      
      if (!orderId.trim()) {
        throw new Error("Please enter an Order ID.");
      }
      
      // Pass the orderId to the submitOrder function
      await submitOrder(orderId);
      
      // Force refresh orders to ensure UI is updated
      refreshOrders();
      
      setIsEditing(false);
      setOrderId("");
    } catch (error: any) {
      console.error("Error submitting order:", error);
      setErrorMessage(error.message || "Failed to submit order");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate current position for queue visualization
  const activeAgents = agents.filter(agent => agent.active);
  const currentPosition = activeAgents.findIndex(agent => agent.id === currentAgentId);
  
  if (!currentUserAgent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not selected</AlertTitle>
            <AlertDescription>
              Please select an agent identity first to submit orders.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Order</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {activeAgents.length > 0 && (
            <div className="mb-6 p-4 bg-background rounded-lg border">
              <h4 className="text-sm font-medium mb-4 text-center">Agent Queue Status</h4>
              
              <QueueDots 
                totalAgents={activeAgents.length} 
                currentPosition={currentPosition}
                agentNames={activeAgents.map(a => ({ id: a.id, name: a.name }))}
                currentAgentId={currentUserAgent?.id}
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
                disabled={!isCurrentUserTurn || isSubmitting}
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Agent: <span className="font-medium">{currentUserAgent.name}</span>
          </div>
          <Button 
            type="submit" 
            disabled={!isCurrentUserTurn || isSubmitting || !orderId.trim()}
          >
            <SendHorizonal className="mr-2 h-4 w-4" />
            Submit Order
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

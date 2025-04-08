
import { useAgent } from "@/contexts/AgentContext";
import { useOrder } from "@/contexts/OrderContext";
import { useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueStatusSection } from "./QueueStatusSection";
import { OrderFormContent } from "./OrderFormContent";
import { useNotSelectedAlert } from "./useNotSelectedAlert";

export function OrderForm() {
  const { currentUserAgent, isCurrentUserTurn, submitOrder } = useAgent();
  const { refreshOrders } = useOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState("");
  
  // Track when the user is actively editing to prevent real-time updates from resetting the input
  const [isEditing, setIsEditing] = useState(false);
  const previousTurnState = useRef(isCurrentUserTurn);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // If no agent is selected, show the not selected alert
  const NotSelectedAlert = useNotSelectedAlert(currentUserAgent);
  if (!currentUserAgent) {
    return NotSelectedAlert;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Order</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <OrderFormContent 
          isCurrentUserTurn={isCurrentUserTurn}
          errorMessage={errorMessage}
          orderId={orderId}
          setOrderId={setOrderId}
          setIsEditing={setIsEditing}
          isSubmitting={isSubmitting}
          inputRef={inputRef}
          previousTurnState={previousTurnState}
        />
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Agent: <span className="font-medium">{currentUserAgent.name}</span>
          </div>
          <QueueStatusSection 
            orderId={orderId}
            isCurrentUserTurn={isCurrentUserTurn}
            isSubmitting={isSubmitting}
          />
        </CardFooter>
      </form>
    </Card>
  );
}

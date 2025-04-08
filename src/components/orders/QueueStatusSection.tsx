
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";

interface QueueStatusSectionProps {
  orderId: string;
  isCurrentUserTurn: boolean;
  isSubmitting: boolean;
}

export function QueueStatusSection({ 
  orderId, 
  isCurrentUserTurn, 
  isSubmitting 
}: QueueStatusSectionProps) {
  return (
    <Button 
      type="submit" 
      disabled={!isCurrentUserTurn || isSubmitting || !orderId.trim()}
    >
      <SendHorizonal className="mr-2 h-4 w-4" />
      Submit Order
    </Button>
  );
}

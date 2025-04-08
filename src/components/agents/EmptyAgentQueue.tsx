
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface EmptyAgentQueueProps {
  onAddAgent: () => void;
}

export function EmptyAgentQueue({ onAddAgent }: EmptyAgentQueueProps) {
  return (
    <div className="text-center py-8 border rounded-lg bg-secondary/30">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted mb-3">
        <Users className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <p className="text-muted-foreground">No active agents available</p>
      <Button variant="outline" className="mt-4" onClick={onAddAgent}>
        Add your first agent
      </Button>
    </div>
  );
}

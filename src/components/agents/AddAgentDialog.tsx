
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddAgentDialogProps {
  onAddAgent: (name: string) => Promise<void>;
}

export function AddAgentDialog({ onAddAgent }: AddAgentDialogProps) {
  const [newAgentName, setNewAgentName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddAgent = async () => {
    if (newAgentName.trim()) {
      await onAddAgent(newAgentName.trim());
      setNewAgentName("");
      setDialogOpen(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-1 h-4 w-4" />
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
            placeholder="Enter agent name"
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddAgent}>Add Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

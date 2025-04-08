
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface MultiTabWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MultiTabWarningModal({ isOpen, onClose }: MultiTabWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            Multiple Tabs Detected
          </DialogTitle>
          <DialogDescription className="pt-2">
            You're already active in another tab. To prevent conflicts, please use only one tab per agent.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800 text-sm">
          <p className="font-medium mb-2">Why this matters:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prevents order submission conflicts</li>
            <li>Ensures accurate turn tracking</li>
            <li>Avoids confusing notifications</li>
          </ul>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

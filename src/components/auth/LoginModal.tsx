
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LoginModal({ isOpen, onOpenChange }: LoginModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(name);
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the login function
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    onOpenChange(false);
    navigate('/signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agent Login</DialogTitle>
          <DialogDescription>
            Enter your agent name to access your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="Enter your agent name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="flex-col items-stretch gap-2 sm:flex-col">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="mt-2 text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Button variant="link" type="button" onClick={handleSignUpClick} className="p-0">
                Sign up
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

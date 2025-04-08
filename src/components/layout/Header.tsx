
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/LoginModal";
import { LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="border-b bg-card">
      <div className="container py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Haifa RTO Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-10 w-24 bg-muted animate-pulse rounded"></div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {user?.name || user?.email}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsLoginModalOpen(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen} 
      />
    </header>
  );
}

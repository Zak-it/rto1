import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null;
  login: (name: string) => Promise<void>;
  register: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('agent_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('User authenticated from localStorage:', userData);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('No active session');
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (name: string) => {
    try {
      setIsLoading(true);

      const { data: existingAgent, error: checkError } = await supabase
        .from('agents')
        .select('*')
        .eq('name', name)
        .single();

      if (existingAgent) {
        throw new Error('Agent with this name already exists');
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const { data: newAgent, error: agentError } = await supabase
        .from('agents')
        .insert([{ name, joinedAt: new Date().toISOString(), active: true }])
        .select()
        .single();

      if (agentError) {
        if (agentError.message && agentError.message.includes('timeout')) {
          toast.error('Connection timeout. Please try again.');
        } else {
          throw agentError;
        }
      }

      if (newAgent) {
        const userData = {
          id: newAgent.id,
          name: newAgent.name,
        };
        localStorage.setItem('agent_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      }

      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (name: string) => {
    try {
      setIsLoading(true);

      const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('name', name)
        .maybeSingle(); // ✅ SAFER version

      if (error) {
        if (error.message && error.message.includes('timeout')) {
          toast.error('Connection timeout. Please try again in a moment.');
        } else {
          throw error;
        }
      }

      if (!agent) {
        throw new Error('Agent not found');
      }

      localStorage.removeItem('agent_user');
      localStorage.removeItem('currentUserAgentId');

      const userData = {
        id: agent.id,
        name: agent.name,
      };

      localStorage.setItem('agent_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      toast.success('Successfully logged in');

      navigate('/dashboard'); // ✅ Clean redirect after login
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('agent_user');
      localStorage.removeItem('currentUserAgentId');
      setUser(null);
      setIsAuthenticated(false);

      window.setTimeout(() => {
        window.location.href = '/login';
      }, 100);

      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

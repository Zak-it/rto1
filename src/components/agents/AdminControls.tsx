
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agent } from "@/types";
import { useAgent } from "@/contexts/AgentContext";
import { Shield, RefreshCw, UserCog } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AdminControls() {
  const { agents, currentAgentId, advanceTurn } = useAgent();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  
  const handleAdvanceTurn = async () => {
    setIsAdvancing(true);
    try {
      await advanceTurn();
    } catch (error) {
      console.error("Failed to advance turn:", error);
    } finally {
      setIsAdvancing(false);
    }
  };
  
  // Sort agents by status - current first, then active, then frozen, then inactive
  const sortedAgents = [...agents].sort((a, b) => {
    // Current turn agent comes first
    if (a.id === currentAgentId) return -1;
    if (b.id === currentAgentId) return 1;
    
    // Then active agents
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    
    // Then by status
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Controls
            </CardTitle>
            <CardDescription>
              Manage agents and queue operations
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="admin-mode" className="text-sm">Admin Mode</Label>
            <Switch
              id="admin-mode"
              checked={isAdmin} 
              onCheckedChange={setIsAdmin}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!isAdmin ? (
          <Alert>
            <AlertTitle>Admin mode is disabled</AlertTitle>
            <AlertDescription>
              Enable admin mode to access queue management controls and agent operations.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="queue">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="queue">Queue Controls</TabsTrigger>
              <TabsTrigger value="agents">Agent Controls</TabsTrigger>
            </TabsList>
            
            <TabsContent value="queue" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Queue Management</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Control the agent queue and turn rotation
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={handleAdvanceTurn}
                      disabled={isAdvancing}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Advance Turn Manually
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="agents" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Agent Management</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    View and manage individual agents
                  </p>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {sortedAgents.map(agent => (
                      <div 
                        key={agent.id}
                        className={`p-3 rounded-md border flex justify-between items-center ${
                          agent.id === currentAgentId ? 'bg-primary/5 border-primary/30' : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {agent.name}
                              {agent.id === currentAgentId && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                              {agent.status === 'frozen' && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                  Frozen
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {agent.order_count} orders • Avg time: {Math.round(agent.average_completion_time || 0)}s
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Admin controls are for designated operators only
      </CardFooter>
    </Card>
  );
}

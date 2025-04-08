
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Agent } from "@/types";

export function useNotSelectedAlert(currentUserAgent: Agent | null) {
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
  
  return null;
}

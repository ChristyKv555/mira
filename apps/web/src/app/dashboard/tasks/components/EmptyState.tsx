"use client";

import { Plus, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  onCreateStatus: () => void;
}

export function EmptyState({ onCreateStatus }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Columns3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            No Status Columns Yet
          </h3>
          <p className="text-muted-foreground max-w-md">
            Create your first status column to start organizing tasks. Status
            columns represent different stages of your workflow.
          </p>
        </div>
        <Button onClick={onCreateStatus} className="mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Status
        </Button>
      </div>
    </Card>
  );
}

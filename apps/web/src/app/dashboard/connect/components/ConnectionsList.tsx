"use client";

import { useState } from "react";
import type { Integration } from "../types";
import { INTEGRATIONS } from "../constants";
import { useDisconnectIntegrationMutation } from "../queries/integrationsApi";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface ConnectionsListProps {
  integrations: Integration[];
}

export function ConnectionsList({ integrations }: ConnectionsListProps) {
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<string | null>(
    null
  );
  const [disconnectIntegration] = useDisconnectIntegrationMutation();

  const activeIntegrations = integrations.filter((int) => int.isActive === 1);

  if (activeIntegrations.length === 0) {
    return null;
  }

  const handleDisconnectClick = (integrationId: string) => {
    setIntegrationToDelete(integrationId);
    setDeleteConfirmOpen(true);
  };

  const confirmDisconnect = async () => {
    if (!integrationToDelete) return;

    try {
      setDisconnectingId(integrationToDelete);
      await disconnectIntegration({
        integrationId: integrationToDelete,
      }).unwrap();
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      alert("Failed to disconnect integration. Please try again.");
    } finally {
      setDisconnectingId(null);
      setIntegrationToDelete(null);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Your Connections</h2>
      <div className="border rounded-lg bg-card p-6">
        <div className="space-y-2">
          {activeIntegrations.map((integration) => {
            const config = INTEGRATIONS.find(
              (i) => i.id === integration.platform
            );
            const Icon = config?.icon;
            const metadata = integration.metadata;
            const connectedAt = metadata?.connectedAt
              ? new Date(metadata.connectedAt)
              : new Date(integration.createdAt);
            const lastSyncTime = metadata?.lastSyncTime
              ? new Date(metadata.lastSyncTime)
              : null;

            return (
              <div
                key={integration.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  {config && Icon && (
                    <div
                      className={`${config.color} p-2 rounded-lg text-white`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {config?.name || integration.platform}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Connected {connectedAt.toLocaleDateString()}</span>
                      {lastSyncTime && (
                        <>
                          <span>•</span>
                          <span>
                            Last sync: {lastSyncTime.toLocaleDateString()}{" "}
                            {lastSyncTime.toLocaleTimeString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {integration.isActive === 1 ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-500">
                      Inactive
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnectClick(integration.id)}
                    disabled={disconnectingId === integration.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {disconnectingId === integration.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Disconnect Integration"
        description="Are you sure you want to disconnect this integration? You will stop receiving notifications."
        confirmText="Disconnect"
        cancelText="Cancel"
        confirmVariant="destructive"
        onConfirm={confirmDisconnect}
      />
    </div>
  );
}

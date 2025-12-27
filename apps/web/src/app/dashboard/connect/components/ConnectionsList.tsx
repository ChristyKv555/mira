"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteIntegrationMutation } from "../queries/integrationsApi";
import type { Integration } from "../types";
import { INTEGRATIONS } from "../constants";

interface ConnectionsListProps {
  integrations: Integration[];
}

export function ConnectionsList({ integrations }: ConnectionsListProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] =
    useState<Integration | null>(null);
  const [deleteIntegration, { isLoading: isDeleting }] =
    useDeleteIntegrationMutation();

  const handleDeleteClick = (integration: Integration) => {
    setIntegrationToDelete(integration);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!integrationToDelete) return;

    try {
      await deleteIntegration({
        integrationId: integrationToDelete.id,
      }).unwrap();
      setDeleteConfirmOpen(false);
      setIntegrationToDelete(null);
    } catch (error) {
      console.error("Error deleting integration:", error);
    }
  };

  if (integrations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Connections</h2>
        <div className="border rounded-lg bg-card p-6">
          <div className="space-y-2">
            {integrations.map((integration) => {
              const config = INTEGRATIONS.find(
                (i) => i.id === integration.platform
              );
              const Icon = config?.icon;

              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {config && Icon && (
                      <div
                        className={`${config.color} p-2 rounded-lg text-white`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {config?.name || integration.platform}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Connected{" "}
                        {new Date(integration.createdAt).toLocaleDateString()}
                      </p>
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
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteClick(integration)}
                      disabled={isDeleting}
                      aria-label={`Delete ${config?.name || integration.platform} connection`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Connection"
        description={
          integrationToDelete
            ? `Are you sure you want to delete your ${
                INTEGRATIONS.find((i) => i.id === integrationToDelete.platform)
                  ?.name || integrationToDelete.platform
              } connection? This action cannot be undone.`
            : "Are you sure you want to delete this connection? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

import type { Integration } from "../types";
import { INTEGRATIONS } from "../constants";

interface ConnectionsListProps {
  integrations: Integration[];
}

export function ConnectionsList({ integrations }: ConnectionsListProps) {
  if (integrations.length === 0) {
    return null;
  }

  return (
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

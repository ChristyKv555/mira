import { IntegrationCard } from "./IntegrationCard";
import type { IntegrationConfig } from "../types";
import type { Integration } from "../types";

interface IntegrationsGridProps {
  integrations: IntegrationConfig[];
  userIntegrations: Integration[];
  connectingId: string | null;
  onConnect: (integrationId: string) => void;
}

export function IntegrationsGrid({
  integrations,
  userIntegrations,
  connectingId,
  onConnect,
}: IntegrationsGridProps) {
  const isConnected = (integrationId: string) => {
    return userIntegrations.some(
      (integration) =>
        integration.platform === integrationId && integration.isActive === 1
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          isConnected={isConnected(integration.id)}
          isConnecting={connectingId === integration.id}
          onConnect={onConnect}
        />
      ))}
    </div>
  );
}


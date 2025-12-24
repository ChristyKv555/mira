import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { IntegrationConfig } from "../types";
import type { Integration } from "../types";

interface IntegrationCardProps {
  integration: IntegrationConfig;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (integrationId: string) => void;
}

export function IntegrationCard({
  integration,
  isConnected,
  isConnecting,
  onConnect,
}: IntegrationCardProps) {
  const Icon = integration.icon;

  return (
    <div className="border rounded-lg bg-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`${integration.color} p-3 rounded-lg text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        {isConnected && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
      </div>

      <h3 className="text-xl font-semibold mb-2">{integration.name}</h3>
      <p className="text-muted-foreground text-sm mb-6">
        {integration.description}
      </p>

      <Button
        onClick={() => onConnect(integration.id)}
        disabled={isConnecting || isConnected}
        className="w-full"
        variant={isConnected ? "outline" : "default"}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Connected
          </>
        ) : (
          "Connect"
        )}
      </Button>
    </div>
  );
}


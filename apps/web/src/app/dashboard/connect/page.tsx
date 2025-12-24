"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Calendar,
  Mail,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface Integration {
  id: string;
  userId: string;
  platform: "slack" | "google-calendar" | "google-mail";
  connectionId: string;
  isActive: number;
  createdAt: string;
}

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const integrations: IntegrationConfig[] = [
  {
    id: "slack",
    name: "Slack",
    description:
      "Connect your Slack workspace to receive notifications and messages",
    icon: MessageSquare,
    color: "bg-purple-500",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description:
      "Sync your calendar events and get notified about upcoming meetings",
    icon: Calendar,
    color: "bg-blue-500",
  },
  {
    id: "google-mail",
    name: "Gmail",
    description: "Connect your Gmail account to receive email notifications",
    icon: Mail,
    color: "bg-red-500",
  },
];

export default function ConnectPage() {
  const [userIntegrations, setUserIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations/list");
      if (response.ok) {
        const data = await response.json();
        setUserIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    try {
      // Connection logic will be implemented in the future
      // fetchIntegrations();
      // setConnecting(null);
    } catch (error) {
      console.error("Error connecting integration:", error);
      setConnecting(null);
      alert("Failed to connect integration. Please try again.");
    }
  };

  const isConnected = (integrationId: string) => {
    return userIntegrations.some(
      (integration) =>
        integration.platform === integrationId && integration.isActive === 1
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Connect</h1>
          <p className="text-muted-foreground">
            Connect your integrations and services to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const connected = isConnected(integration.id);
            const isConnecting = connecting === integration.id;

            return (
              <div
                key={integration.id}
                className="border rounded-lg bg-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${integration.color} p-3 rounded-lg text-white`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {connected && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {integration.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {integration.description}
                </p>

                <Button
                  onClick={() => handleConnect(integration.id)}
                  disabled={isConnecting || connected}
                  className="w-full"
                  variant={connected ? "outline" : "default"}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : connected ? (
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
          })}
        </div>

        {userIntegrations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Your Connections</h2>
            <div className="border rounded-lg bg-card p-6">
              <div className="space-y-2">
                {userIntegrations.map((integration) => {
                  const config = integrations.find(
                    (i) => i.id === integration.platform
                  );
                  return (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {config && (
                          <div
                            className={`${config.color} p-2 rounded-lg text-white`}
                          >
                            <config.icon className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {config?.name || integration.platform}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Connected{" "}
                            {new Date(
                              integration.createdAt
                            ).toLocaleDateString()}
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
        )}
      </div>
    </div>
  );
}

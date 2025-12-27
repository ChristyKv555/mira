"use client";

import { useState } from "react";
import Nango from "@nangohq/frontend";
import {
  useGetIntegrationsQuery,
  useGetConnectSessionMutation,
} from "./queries/integrationsApi";
import { ConnectHeader } from "./components/ConnectHeader";
import { IntegrationsGrid } from "./components/IntegrationsGrid";
import { ConnectionsList } from "./components/ConnectionsList";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { INTEGRATIONS } from "./constants";

// Initialize Nango frontend SDK (uses defaults if env vars not set)
const nango = new Nango();

export default function ConnectPage() {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useGetIntegrationsQuery();
  const [getConnectSession] = useGetConnectSessionMutation();

  const userIntegrations = data?.integrations || [];

  const handleConnect = async (integrationId: string) => {
    try {
      setConnectingId(integrationId);

      // Get session token from backend
      const sessionResponse = await getConnectSession({
        platform: integrationId,
      }).unwrap();

      // Open Nango Connect UI
      const connectUI = nango.openConnectUI({
        sessionToken: sessionResponse.sessionToken,
        onEvent: (event) => {
          if (event.type === "close") {
            // User closed the modal
            setConnectingId(null);
          } else if (event.type === "connect") {
            // Connection successful - webhook will handle saving to DB
            // Refresh integrations list after a short delay to allow webhook to process
            setTimeout(() => {
              refetch();
              setConnectingId(null);
            }, 1000);
          }
        },
      });
    } catch (error) {
      console.error("Error connecting integration:", error);
      alert("Failed to connect integration. Please try again.");
      setConnectingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center text-red-500">
          Failed to load integrations. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        <ConnectHeader />
        <IntegrationsGrid
          integrations={INTEGRATIONS}
          userIntegrations={userIntegrations}
          connectingId={connectingId}
          onConnect={handleConnect}
        />
        <ConnectionsList integrations={userIntegrations} />
      </div>
    </div>
  );
}

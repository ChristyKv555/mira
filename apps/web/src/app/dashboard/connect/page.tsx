"use client";

import { useState } from "react";
import {
  useGetIntegrationsQuery,
  useConnectIntegrationMutation,
} from "./queries/integrationsApi";
import { ConnectHeader } from "./components/ConnectHeader";
import { IntegrationsGrid } from "./components/IntegrationsGrid";
import { ConnectionsList } from "./components/ConnectionsList";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { INTEGRATIONS } from "./constants";

export default function ConnectPage() {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const { data, isLoading, error } = useGetIntegrationsQuery();
  const [connectIntegration] = useConnectIntegrationMutation();

  const userIntegrations = data?.integrations || [];

  const handleConnect = async (integrationId: string) => {
    try {
      setConnectingId(integrationId);
      await connectIntegration({ platform: integrationId }).unwrap();
    } catch (error) {
      console.error("Error connecting integration:", error);
      alert("Failed to connect integration. Please try again.");
    } finally {
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

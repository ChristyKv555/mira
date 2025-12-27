"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useGetIntegrationsQuery();
  const [connectIntegration] = useConnectIntegrationMutation();

  const userIntegrations = data?.integrations || [];

  // Handle OAuth callback success/error messages
  useEffect(() => {
    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (success === "true") {
      // Reset connecting state after successful connection
      setConnectingId(null);
    } else if (errorParam) {
      alert(`Failed to connect: ${decodeURIComponent(errorParam)}`);
      setConnectingId(null);
    }
  }, [searchParams]);

  const handleConnect = async (integrationId: string) => {
    try {
      setConnectingId(integrationId);

      // Check if this is a Google integration that requires OAuth
      if (
        integrationId === "google-calendar" ||
        integrationId === "google-mail"
      ) {
        // Call the connect API to get OAuth URL
        const response = await connectIntegration({
          platform: integrationId,
        }).unwrap();

        // Redirect to Google OAuth consent screen
        if (response.authUrl) {
          // State already includes platform, just redirect
          window.location.href = response.authUrl;
          return; // Don't reset connectingId yet, will be reset after redirect
        }
      } else {
        // For non-Google integrations, use the existing flow
        await connectIntegration({ platform: integrationId }).unwrap();
        setConnectingId(null);
      }
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

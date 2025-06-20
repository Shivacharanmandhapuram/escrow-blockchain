import React, { useState, useEffect } from "react";
import algosdk from "algosdk";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [appClient, setAppClient] = useState<any>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { HelloWorldClient } = await import("./contracts/HelloWorld");

        const algodClient = new algosdk.Algodv2(
          "",
          "https://testnet-api.algonode.cloud",
          "",
        );

        // Fix: Use the correct constructor format
        const client = new HelloWorldClient(
          {
            resolveBy: "id",
            id: 741584998,
          },
          algodClient,
        );

        setAppClient(client);
        setMessage("App initialized successfully!");

        // Don't call hello immediately - let user click the button
      } catch (error) {
        console.error("Initialization error:", error);
        setMessage(`Error: ${(error as Error).message}`);
      }
    };

    initializeApp();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <h1>Client-Agency Registry</h1>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <p>
          <strong>Status:</strong> {message}
        </p>
        {appClient && (
          <div>
            <p>
              <strong>App ID:</strong> {appClient.appId}
            </p>
            <TestButtons appClient={appClient} />
          </div>
        )}
      </div>
    </div>
  );
}

function TestButtons({ appClient }: { appClient: any }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const testHelloOnly = async () => {
    setLoading(true);
    try {
      // Test the simplest method first with proper argument structure
      const response = await appClient.hello({
        name: "Test",
      });
      setResult(`Hello: ${response.return?.valueOf()}`);
    } catch (error) {
      console.error("Hello error details:", error);
      setResult(`Hello Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetStats = async () => {
    setLoading(true);
    try {
      // Test getter methods without arguments
      const agencies = await appClient.getAgencyCount();
      const searches = await appClient.getSearchCount();
      const info = await appClient.getRegistryInfo();

      setResult(
        `Stats - Agencies: ${agencies.return?.valueOf()}, Searches: ${searches.return?.valueOf()}, Info: ${info.return?.valueOf()}`,
      );
    } catch (error) {
      console.error("Stats error details:", error);
      setResult(`Stats Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegisterAgency = async () => {
    setLoading(true);
    try {
      const response = await appClient.registerAgency({
        name: "Test Agency",
        description: "Test Description",
        contactInfo: "test@example.com",
      });
      setResult(`Register: ${response.return?.valueOf()}`);
    } catch (error) {
      console.error("Register error details:", error);
      setResult(`Register Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSearchAgencies = async () => {
    setLoading(true);
    try {
      const response = await appClient.searchAgencies({
        searchTerm: "web development",
      });
      setResult(`Search: ${response.return?.valueOf()}`);
    } catch (error) {
      console.error("Search error details:", error);
      setResult(`Search Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={testHelloOnly}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginRight: "10px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Test Hello (Simple)"}
      </button>

      <button
        onClick={testGetStats}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginRight: "10px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Test Get Stats"}
      </button>

      <button
        onClick={testRegisterAgency}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginRight: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Test Register Agency"}
      </button>

      <button
        onClick={testSearchAgencies}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#17a2b8",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Test Search Agencies"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
          }}
        >
          <strong>Result:</strong> {result}
        </div>
      )}
    </div>
  );
}

export default App;

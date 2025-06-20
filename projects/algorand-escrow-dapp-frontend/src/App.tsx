import React, { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { ClientAgencyRegistryClient } from "./contracts/HelloWorld";
import { AgencyRegistration } from "./components/AgencyRegistration";
import { AgencySearch } from "./components/AgencySearch";
import { RegistryStats } from "./components/RegistryStats";
import algosdk from "algosdk";

function App() {
  const { providers, activeAccount } = useWallet();
  const [appClient, setAppClient] = useState<ClientAgencyRegistryClient | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"search" | "register">("search");

  useEffect(() => {
    // Initialize the app client
    const algodClient = new algosdk.Algodv2(
      "",
      "https://testnet-api.algonode.cloud",
      "",
    );

    // Replace with your deployed app ID
    const APP_ID = 123456789; // Your actual app ID from deployment

    const client = new ClientAgencyRegistryClient(
      {
        resolveBy: "id",
        id: APP_ID,
      },
      algodClient,
    );

    setAppClient(client);
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Client-Agency Registry</h1>
        </div>
        <div className="flex-none">
          {activeAccount ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost">
                {activeAccount.address.slice(0, 8)}...
              </label>
            </div>
          ) : (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-primary">
                Connect Wallet
              </label>
              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                {providers?.map((provider) => (
                  <li key={provider.metadata.id}>
                    <button onClick={provider.connect}>
                      {provider.metadata.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {appClient && <RegistryStats appClient={appClient} />}

        <div className="tabs tabs-boxed justify-center my-8">
          <button
            className={`tab ${activeTab === "search" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            Search Agencies
          </button>
          <button
            className={`tab ${activeTab === "register" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register Agency
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          {appClient && activeTab === "search" && (
            <AgencySearch appClient={appClient} />
          )}
          {appClient && activeTab === "register" && (
            <AgencyRegistration appClient={appClient} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

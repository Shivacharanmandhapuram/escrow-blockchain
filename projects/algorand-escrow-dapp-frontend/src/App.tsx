import React, { useState, useEffect, createContext, useContext } from "react";
import algosdk from "algosdk";
import WalletConnection from "./components/WalletConnection";
import RegisterAgency from "./components/RegisterAgency";
import AgencyList from "./components/AgencyList";
import Navigation from "./components/Navigation";

// Types
interface WalletContextType {
  algodClient: algosdk.Algodv2 | null;
  account: algosdk.Account | null;
  accountAddress: string | null; // Store address as string separately
  isConnected: boolean;
  connectWallet: (mnemonic: string) => Promise<void>;
  disconnectWallet: () => void;
  appId: number;
}

// Context
const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};

// Main App Component
export default function App() {
  const [algodClient, setAlgodClient] = useState<algosdk.Algodv2 | null>(null);
  const [account, setAccount] = useState<algosdk.Account | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "register" | "list">(
    "home",
  );
  const [status, setStatus] = useState("Initializing...");

  const APP_ID = 741599695;

  useEffect(() => {
    // Initialize Algorand client following official SDK documentation
    const initializeAlgorand = async () => {
      try {
        // Following official SDK documentation pattern
        const algodToken = "";
        const algodServer = "https://testnet-api.algonode.cloud";
        const algodPort = "";

        const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

        // Test connection
        const nodeStatus = await client.status().do();
        console.log("Connected to Algorand node:", nodeStatus);

        setAlgodClient(client);
        setStatus("Ready to connect wallet");
      } catch (error) {
        console.error("Failed to initialize Algorand client:", error);
        setStatus("Failed to connect to Algorand network");
      }
    };

    initializeAlgorand();
  }, []);

  const connectWallet = async (mnemonic: string) => {
    try {
      if (!algodClient) {
        throw new Error("Algorand client not initialized");
      }

      // Convert mnemonic to account following SDK documentation
      const walletAccount = algosdk.mnemonicToSecretKey(mnemonic);

      // Extract address as string - this is the key fix
      const addressString = walletAccount.addr.toString();
      console.log("Account address (string):", addressString);
      console.log("Address type:", typeof addressString);

      // Validate account by checking if it exists on network
      const accountInfo = await algodClient
        .accountInformation(addressString)
        .do();
      console.log("Account info:", accountInfo);

      setAccount(walletAccount);
      setAccountAddress(addressString); // Store address separately as string
      setIsConnected(true);
      setStatus(`Connected: ${addressString}`);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw new Error(`Wallet connection failed: ${(error as Error).message}`);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setAccountAddress(null);
    setIsConnected(false);
    setStatus("Wallet disconnected");
    setCurrentView("home");
  };

  const walletContextValue: WalletContextType = {
    algodClient,
    account,
    accountAddress,
    isConnected,
    connectWallet,
    disconnectWallet,
    appId: APP_ID,
  };

  return (
    <WalletContext.Provider value={walletContextValue}>
      <div
        style={{
          padding: "20px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            color: "white",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px" }}>
            🏦 Algorand Escrow Service
          </h1>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>
            Mnemonic-based wallet connection for secure escrow transactions
          </p>
        </div>

        {/* Status */}
        <div
          style={{
            padding: "15px",
            backgroundColor: "white",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p>
            <strong>Status:</strong> {status}
          </p>
          {isConnected && accountAddress && (
            <p style={{ fontSize: "12px", fontFamily: "monospace" }}>
              <strong>Connected Wallet:</strong> {accountAddress}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          }}
        >
          {!isConnected ? (
            <WalletConnection />
          ) : (
            <>
              <Navigation
                currentView={currentView}
                setCurrentView={setCurrentView}
              />

              {currentView === "home" && <HomeView />}
              {currentView === "register" && <RegisterAgency />}
              {currentView === "list" && <AgencyList />}
            </>
          )}
        </div>
      </div>
    </WalletContext.Provider>
  );
}

// Home View Component
function HomeView() {
  const { accountAddress, disconnectWallet } = useWallet();

  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        Welcome to Algorand Escrow Service
      </h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Your wallet is connected and ready to use the escrow service.
      </p>

      <div
        style={{
          backgroundColor: "#e8f5e8",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
          ✅ Wallet Connected
        </h3>
        <p style={{ fontFamily: "monospace", fontSize: "14px", color: "#666" }}>
          {accountAddress?.toString()}
        </p>
      </div>

      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        <button
          onClick={disconnectWallet}
          style={{
            padding: "12px 24px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          🔌 Disconnect Wallet
        </button>
      </div>
    </div>
  );
}

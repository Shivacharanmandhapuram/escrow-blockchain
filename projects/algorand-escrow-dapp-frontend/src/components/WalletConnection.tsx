import React, { useState } from "react";
import { useWallet } from "../App";

export default function WalletConnection() {
  const { connectWallet } = useWallet();
  const [mnemonic, setMnemonic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    if (!mnemonic.trim()) {
      setError("Please enter your mnemonic phrase");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await connectWallet(mnemonic);
      setMnemonic(""); // Clear mnemonic for security
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2
        style={{ color: "#2c3e50", marginBottom: "20px", textAlign: "center" }}
      >
        Connect Your Algorand Wallet
      </h2>

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>
          🔐 Enter Your Mnemonic
        </h3>
        <textarea
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
          placeholder="Enter your 25-word mnemonic phrase..."
          rows={4}
          style={{
            width: "100%",
            padding: "15px",
            border: "2px solid #e9ecef",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "monospace",
            resize: "vertical",
          }}
        />
        <small style={{ color: "#666", fontSize: "12px" }}>
          🔒 Your mnemonic is processed locally and never stored or transmitted
        </small>
      </div>

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
            color: "#721c24",
            marginBottom: "20px",
          }}
        >
          ❌ {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={loading || !mnemonic.trim()}
        style={{
          width: "100%",
          padding: "15px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "600",
          fontSize: "16px",
        }}
      >
        {loading ? "🔄 Connecting..." : "🔗 Connect Wallet"}
      </button>

      {/* Instructions */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#e3f2fd",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <h4 style={{ color: "#1976d2", marginBottom: "15px" }}>
          💡 How to Get Your Mnemonic
        </h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#1976d2" }}>
          <li>Use your existing Algorand wallet mnemonic (25 words)</li>
          <li>Create a new wallet using official Algorand tools</li>
          <li>Export mnemonic from Pera Wallet or other Algorand wallets</li>
          <li>
            Generate using AlgoSDK: <code>algosdk.generateAccount()</code>
          </li>
        </ul>
      </div>
    </div>
  );
}

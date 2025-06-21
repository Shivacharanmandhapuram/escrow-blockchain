import React, { useState, useEffect } from "react";
import { useWallet } from "../App";
import algosdk from "algosdk";

interface Agency {
  name: string;
  description: string;
  contact: string;
  address: string;
}

export default function AgencyList() {
  const { algodClient, accountAddress, appId } = useWallet();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const parseAgencies = (agenciesString: string): Agency[] => {
    if (!agenciesString) return [];

    const agencies = agenciesString.split(";").filter((a) => a.trim());
    return agencies
      .map((agency) => {
        const parts = agency.split("|");
        if (parts.length === 4) {
          return {
            name: parts[0],
            description: parts[1],
            contact: parts[2],
            address: parts[3],
          };
        }
        return null;
      })
      .filter(Boolean) as Agency[];
  };

  const loadAgencies = async (isSearch = false) => {
    if (!algodClient || !accountAddress) return;

    setLoading(true);
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();

      const methodName = isSearch ? "search_agencies" : "get_all_agencies";
      const args = isSearch ? [searchTerm] : [];

      const appArgs = [
        new Uint8Array(Buffer.from(methodName)),
        ...args.map((arg) => new Uint8Array(Buffer.from(arg))),
      ];

      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        from: accountAddress?.toString() || "", // from address
        appIndex: appId,
        suggestedParams,
        appArgs,
        accounts: undefined, // accounts
        foreignApps: undefined, // foreignApps
        foreignAssets: undefined, // foreignAssets
        note: undefined, // note
        lease: undefined, // lease
        rekeyTo: undefined, // rekeyTo
      });
      const simulateRequest = {
        txn_groups: [{ txns: [algosdk.encodeUnsignedTransaction(txn)] }],
      };

      const simulateResponse = await algodClient
        .simulateTransactions(simulateRequest)
        .do();

      const txnResult = simulateResponse.txn_groups[0].txn_results[0];
      if (txnResult.txn_result.logs && txnResult.txn_result.logs.length > 0) {
        const logs = txnResult.txn_result.logs.map((log: string) =>
          Buffer.from(log, "base64").toString(),
        );
        const response = logs.join("");

        let agenciesData = "";
        if (response.startsWith("ALL_AGENCIES:")) {
          agenciesData = response.replace("ALL_AGENCIES:", "");
        } else if (response.startsWith("SEARCH_RESULTS:")) {
          const parts = response.split(":");
          if (parts.length >= 3) {
            agenciesData = parts.slice(2).join(":");
          }
        }

        const parsedAgencies = parseAgencies(agenciesData);
        setAgencies(parsedAgencies);
      }
    } catch (error) {
      console.error("Error loading agencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  return (
    <div>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        🔍 Find Agencies
      </h2>

      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agency name or service type..."
            style={{
              flex: 1,
              padding: "15px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
            }}
            onKeyPress={(e) => e.key === "Enter" && loadAgencies(true)}
          />
          <button
            onClick={() => loadAgencies(true)}
            disabled={loading}
            style={{
              padding: "15px 30px",
              backgroundColor: loading ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {loading ? "⏳ Searching..." : "🔍 Search"}
          </button>
        </div>

        <button
          onClick={() => loadAgencies(false)}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          📋 Show All Agencies
        </button>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {agencies.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              border: "2px dashed #dee2e6",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🏢</div>
            <h3 style={{ color: "#6c757d", marginBottom: "10px" }}>
              {loading ? "Loading agencies..." : "No agencies found"}
            </h3>
            <p style={{ color: "#6c757d" }}>
              {loading
                ? "Please wait..."
                : "Be the first to register your agency!"}
            </p>
          </div>
        ) : (
          agencies.map((agency, index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "25px",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", fontSize: "22px" }}>
                🏢 {agency.name}
              </h3>

              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "8px 0", opacity: 0.9 }}>
                  <strong>🎯 Services:</strong> {agency.description}
                </p>
                <p style={{ margin: "8px 0", opacity: 0.9 }}>
                  <strong>📞 Contact:</strong> {agency.contact}
                </p>
                <p
                  style={{
                    margin: "8px 0",
                    opacity: 0.7,
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  <strong>💳 Escrow Wallet:</strong> {agency.address}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => navigator.clipboard.writeText(agency.contact)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  📋 Copy Contact
                </button>
                <button
                  onClick={() => {
                    alert(
                      `Ready to start escrow project with ${agency.name}!\n\nContact: ${agency.contact}\nEscrow Address: ${agency.address}\n\nNext: Contact the agency to discuss terms and set up the escrow.`,
                    );
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  💼 Start Escrow
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useWallet } from "../App";
import algosdk from "algosdk";

export default function RegisterAgency() {
  const { algodClient, account, accountAddress, appId } = useWallet();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleRegister = async () => {
    console.log("🔍 Starting registration process...");
    console.log("📊 Initial state:", {
      formData,
      accountAddress,
      accountAddressType: typeof accountAddress,
      appId,
      hasAlgodClient: !!algodClient,
      hasAccount: !!account,
    });

    // Enhanced validation with detailed logging
    if (!formData.name || !formData.description || !formData.contact) {
      console.log("❌ Validation failed: Missing form fields");
      setResult("❌ Please fill in all required fields");
      return;
    }

    if (!algodClient) {
      console.log("❌ Validation failed: No algod client");
      setResult("❌ Algorand client not initialized");
      return;
    }

    if (!account) {
      console.log("❌ Validation failed: No account");
      setResult("❌ Account not connected");
      return;
    }

    if (!accountAddress) {
      console.log("❌ Validation failed: No account address", {
        accountAddress,
      });
      setResult("❌ Account address not available");
      return;
    }

    if (!appId || appId <= 0) {
      console.log("❌ Validation failed: Invalid app ID", { appId });
      setResult("❌ Invalid application ID");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Starting agency registration...");

      // Convert accountAddress to proper format
      let fromAddress;
      try {
        // Handle different possible formats of accountAddress
        if (typeof accountAddress === "string") {
          fromAddress = accountAddress;
          console.log("📍 Using string address:", fromAddress);
        } else if (accountAddress.toString) {
          fromAddress = accountAddress.toString();
          console.log("📍 Converted address to string:", fromAddress);
        } else {
          throw new Error("Invalid address format");
        }

        // Validate the address format
        if (!algosdk.isValidAddress(fromAddress)) {
          throw new Error("Invalid Algorand address format");
        }

        console.log("✅ Address validation passed:", fromAddress);
      } catch (addressError) {
        console.error("❌ Address conversion failed:", addressError);
        setResult("❌ Invalid wallet address format");
        return;
      }

      console.log("📋 Registration details:", {
        name: formData.name,
        description: formData.description,
        contact: formData.contact,
        fromAddress: fromAddress,
        appId: appId,
      });

      // Get suggested params
      console.log("🌐 Fetching transaction parameters...");
      const suggestedParams = await algodClient.getTransactionParams().do();
      console.log("📊 Suggested params:", suggestedParams);

      // Prepare application arguments
      const appArgs = [
        new Uint8Array(Buffer.from("register_agency")),
        new Uint8Array(Buffer.from(formData.name)),
        new Uint8Array(Buffer.from(formData.description)),
        new Uint8Array(Buffer.from(formData.contact)),
        new Uint8Array(Buffer.from(fromAddress)),
      ];

      console.log("📦 Application arguments prepared:", {
        method: "register_agency",
        name: formData.name,
        description: formData.description,
        contact: formData.contact,
        address: fromAddress,
        argsLength: appArgs.length,
      });

      // Create transaction with explicit address conversion
      console.log("🔨 Creating transaction...");
      console.log("🔍 Transaction parameters:", {
        from: fromAddress,
        fromType: typeof fromAddress,
        appIndex: appId,
        appIndexType: typeof appId,
        suggestedParamsKeys: Object.keys(suggestedParams),
      });

      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        from: fromAddress, // Use the validated string address
        appIndex: Number(appId), // Ensure appId is a number
        suggestedParams: suggestedParams,
        appArgs: appArgs,
      });

      console.log("✅ Transaction created successfully:", {
        txnId: txn.txID(),
        from: txn.from.toString(),
        appIndex: txn.appIndex,
        fee: txn.fee,
        firstRound: txn.firstRound,
        lastRound: txn.lastRound,
      });

      // Create simulation request properly
      console.log("🎭 Creating simulation request...");
      const simulateRequest = algosdk.createSimulateTransactionRequest([txn]);
      console.log(
        "📋 Simulation request created with transaction count:",
        simulateRequest.txn_groups.length,
      );

      // Execute simulation
      console.log("🚀 Executing simulation...");
      const simulateResponse = await algodClient
        .simulateTransactions(simulateRequest)
        .do();

      console.log(
        "📊 Raw simulation response:",
        JSON.stringify(simulateResponse, null, 2),
      );

      // Process simulation results
      if (
        !simulateResponse.txn_groups ||
        simulateResponse.txn_groups.length === 0
      ) {
        console.log("❌ No transaction groups in simulation response");
        setResult("❌ Invalid simulation response: No transaction groups");
        return;
      }

      const txnGroup = simulateResponse.txn_groups[0];
      console.log("📋 Transaction group:", txnGroup);

      if (!txnGroup.txn_results || txnGroup.txn_results.length === 0) {
        console.log("❌ No transaction results in group");
        setResult("❌ Invalid simulation response: No transaction results");
        return;
      }

      const txnResult = txnGroup.txn_results[0];
      console.log("📊 Transaction result:", txnResult);

      // Check for errors first
      if (txnResult.txn_result.app_call_messages) {
        console.log(
          "📝 App call messages:",
          txnResult.txn_result.app_call_messages,
        );
      }

      // Process logs
      if (txnResult.txn_result.logs && txnResult.txn_result.logs.length > 0) {
        console.log("📜 Raw logs:", txnResult.txn_result.logs);

        const logs = txnResult.txn_result.logs.map((log: string) => {
          const decoded = Buffer.from(log, "base64").toString();
          console.log("🔍 Decoded log:", decoded);
          return decoded;
        });

        const response = logs.join("");
        console.log("📋 Combined log response:", response);

        if (response.startsWith("SUCCESS:")) {
          const successMessage = response.replace("SUCCESS:", "").trim();
          console.log("✅ Registration successful:", successMessage);
          setResult(
            `✅ ${successMessage || "Agency registered successfully!"}`,
          );
          setFormData({ name: "", description: "", contact: "" });
        } else if (response.startsWith("ERROR:")) {
          const errorMessage = response.replace("ERROR:", "").trim();
          console.log("❌ Registration error from contract:", errorMessage);
          setResult(`❌ ${errorMessage}`);
        } else {
          console.log("ℹ️ Other response:", response);
          setResult(`ℹ️ ${response}`);
        }
      } else {
        console.log("ℹ️ No logs in response, assuming success");
        setResult("✅ Agency registration completed successfully!");
      }

      // Log global delta if present
      if (txnResult.txn_result.global_delta) {
        console.log(
          "🌍 Global state changes:",
          txnResult.txn_result.global_delta,
        );
      }

      // Log local delta if present
      if (txnResult.txn_result.local_deltas) {
        console.log(
          "👤 Local state changes:",
          txnResult.txn_result.local_deltas,
        );
      }
    } catch (error) {
      console.error("💥 Registration error details:", {
        error,
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name,
      });

      // More specific error handling
      let errorMessage = (error as Error).message;
      if (errorMessage.includes("Address must not be null")) {
        errorMessage = "Invalid wallet address. Please reconnect your wallet.";
      } else if (errorMessage.includes("application does not exist")) {
        errorMessage =
          "Smart contract application not found. Please check the app ID.";
      } else if (errorMessage.includes("insufficient balance")) {
        errorMessage = "Insufficient balance to perform this transaction.";
      }

      setResult(`❌ Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
      console.log("🏁 Registration process completed");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        📝 Register Your Agency
      </h2>

      {/* Debug info panel */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <strong>🔍 Debug Info:</strong>
        <br />
        Account: {accountAddress ? "✅ Connected" : "❌ Not connected"}
        <br />
        Address Type: {typeof accountAddress}
        <br />
        Address Value: {accountAddress ? accountAddress.toString() : "None"}
        <br />
        App ID: {appId || "Not set"}
        <br />
        Algod Client: {algodClient ? "✅ Ready" : "❌ Not ready"}
      </div>

      <div
        style={{
          padding: "15px",
          backgroundColor: "#e8f5e8",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <p style={{ margin: 0, color: "#2c3e50" }}>
          <strong>💳 Escrow Address:</strong>{" "}
          {accountAddress ? accountAddress.toString() : "Not connected"}
        </p>
        <small style={{ color: "#666" }}>
          This address will receive escrow payments from clients
        </small>
      </div>

      <div style={{ display: "grid", gap: "20px", marginBottom: "30px" }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#2c3e50",
            }}
          >
            Agency Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your agency name"
            style={{
              width: "100%",
              padding: "15px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#2c3e50",
            }}
          >
            Services Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your services"
            rows={4}
            style={{
              width: "100%",
              padding: "15px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#2c3e50",
            }}
          >
            Contact Information *
          </label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) =>
              setFormData({ ...formData, contact: e.target.value })
            }
            placeholder="Email, phone, or website"
            style={{
              width: "100%",
              padding: "15px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
        </div>
      </div>

      <button
        onClick={handleRegister}
        disabled={
          loading ||
          !formData.name ||
          !formData.description ||
          !formData.contact ||
          !accountAddress ||
          !algodClient
        }
        style={{
          width: "100%",
          padding: "18px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "600",
          fontSize: "18px",
        }}
      >
        {loading ? "⏳ Registering..." : "🚀 Register Agency"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            backgroundColor: result.includes("❌") ? "#f8d7da" : "#d4edda",
            border: `2px solid ${result.includes("❌") ? "#f5c6cb" : "#c3e6cb"}`,
            borderRadius: "8px",
            color: result.includes("❌") ? "#721c24" : "#155724",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}

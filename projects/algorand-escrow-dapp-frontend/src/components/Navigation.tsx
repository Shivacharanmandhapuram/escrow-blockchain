import React from "react";
import { useWallet } from "../App";

interface NavigationProps {
  currentView: "home" | "register" | "list";
  setCurrentView: (view: "home" | "register" | "list") => void;
}

export default function Navigation({
  currentView,
  setCurrentView,
}: NavigationProps) {
  const { accountAddress, disconnectWallet } = useWallet();

  const navItems = [
    { key: "home" as const, label: "🏠 Home", color: "#28a745" },
    { key: "register" as const, label: "📝 Register Agency", color: "#007bff" },
    { key: "list" as const, label: "🔍 Find Agencies", color: "#17a2b8" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
      }}
    >
      <div style={{ display: "flex", gap: "10px" }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setCurrentView(item.key)}
            style={{
              padding: "10px 20px",
              backgroundColor:
                currentView === item.key ? item.color : "transparent",
              color: currentView === item.key ? "white" : item.color,
              border: `2px solid ${item.color}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span style={{ fontSize: "12px", color: "#666" }}>
          {accountAddress
            ? `${accountAddress.toString().slice(0, 8)}...${accountAddress.toString().slice(-8)}`
            : "No wallet"}
        </span>
        <button
          onClick={disconnectWallet}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          🔌 Disconnect
        </button>
      </div>
    </div>
  );
}

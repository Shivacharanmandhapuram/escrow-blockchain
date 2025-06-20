import React, { useState, useEffect } from "react";
import { ClientAgencyRegistryClient } from "../contracts/HelloWorld";

interface RegistryStatsProps {
  appClient: ClientAgencyRegistryClient;
}

export const RegistryStats: React.FC<RegistryStatsProps> = ({ appClient }) => {
  const [stats, setStats] = useState({
    agencies: 0,
    searches: 0,
    info: "",
  });

  const loadStats = async () => {
    try {
      const [agencyCount, searchCount, registryInfo] = await Promise.all([
        appClient.getAgencyCount(),
        appClient.getSearchCount(),
        appClient.getRegistryInfo(),
      ]);

      setStats({
        agencies: Number(agencyCount.return?.valueOf() || 0),
        searches: Number(searchCount.return?.valueOf() || 0),
        info: registryInfo.return?.valueOf() || "",
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, [appClient]);

  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">Registered Agencies</div>
        <div className="stat-value text-primary">{stats.agencies}</div>
      </div>

      <div className="stat">
        <div className="stat-title">Total Searches</div>
        <div className="stat-value text-secondary">{stats.searches}</div>
      </div>

      <div className="stat">
        <div className="stat-title">Registry Status</div>
        <div className="stat-desc">{stats.info}</div>
        <button className="btn btn-sm btn-outline mt-2" onClick={loadStats}>
          Refresh
        </button>
      </div>
    </div>
  );
};

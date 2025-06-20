import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { ClientAgencyRegistryClient } from "../contracts/HelloWorld";

interface AgencySearchProps {
  appClient: ClientAgencyRegistryClient;
}

export const AgencySearch: React.FC<AgencySearchProps> = ({ appClient }) => {
  const { activeAccount } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const result = await appClient.searchAgencies({
        searchTerm: searchTerm,
      });

      setSearchResults(result.return?.valueOf() || "No results found");
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-secondary">Search Agencies</h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search for agencies</span>
            </label>
            <div className="join">
              <input
                type="text"
                className="input input-bordered join-item flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term..."
                required
              />
              <button
                type="submit"
                className={`btn btn-secondary join-item ${loading ? "loading" : ""}`}
                disabled={loading || !activeAccount}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        {searchResults && (
          <div className="alert alert-info mt-4">
            <div>
              <h3 className="font-bold">Search Results:</h3>
              <p>{searchResults}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { ClientAgencyRegistryClient } from "../contracts/HelloWorld";
import algosdk from "algosdk";

interface AgencyRegistrationProps {
  appClient: ClientAgencyRegistryClient;
}

export const AgencyRegistration: React.FC<AgencyRegistrationProps> = ({
  appClient,
}) => {
  const { activeAccount, signTransactions, sendTransactions } = useWallet();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactInfo: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) {
      setMessage("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await appClient.registerAgency({
        name: formData.name,
        description: formData.description,
        contactInfo: formData.contactInfo,
      });

      setMessage(`Success: ${result.return?.valueOf()}`);
      setFormData({ name: "", description: "", contactInfo: "" });
    } catch (error) {
      console.error("Registration failed:", error);
      setMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">Register Your Agency</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Agency Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter your agency name"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Describe your agency services"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Contact Information</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.contactInfo}
              onChange={(e) =>
                setFormData({ ...formData, contactInfo: e.target.value })
              }
              required
              placeholder="Email, phone, or website"
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            disabled={loading || !activeAccount}
          >
            {loading ? "Registering..." : "Register Agency"}
          </button>
        </form>

        {message && (
          <div
            className={`alert ${message.includes("Success") ? "alert-success" : "alert-error"} mt-4`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

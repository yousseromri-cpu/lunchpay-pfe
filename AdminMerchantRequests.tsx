import { useEffect, useState } from "react";
import {
  getMerchantRequests,
  updateMerchantRequestStatus,
} from "../../services/platformStore";
import type {
  MerchantRequest,
  RequestStatus,
} from "../../services/platformStore";

export default function AdminMerchantRequests() {
  const [requests, setRequests] = useState<MerchantRequest[]>([]);
  const [selected, setSelected] = useState<MerchantRequest | null>(null);

  useEffect(() => {
    const items = getMerchantRequests();
    setRequests(items);
    setSelected(items[0] || null);
  }, []);

  function updateStatus(id: string, status: RequestStatus) {
    const updated = updateMerchantRequestStatus(id, status);
    setRequests(updated);
    setSelected(updated.find((item) => item.id === id) || null);
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "10px" }}>
          Merchant Requests
        </h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
          Review merchant onboarding requests before granting access to the LunchPay merchant portal.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 0.75fr",
          gap: "18px",
        }}
      >
        <div className="glass-soft" style={{ padding: "18px", borderRadius: "24px" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Merchant</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.id}</td>
                  <td>{item.merchantName}</td>
                  <td>{item.contactName}</td>
                  <td>{item.category}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-soft" style={{ padding: "20px", borderRadius: "24px" }}>
          {selected ? (
            <>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "16px" }}>
                {selected.merchantName}
              </h3>

              <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                <div>{selected.workEmail}</div>
                <div>{selected.phone}</div>
                <div>{selected.country}</div>
                <div>{selected.city}</div>
                <div>{selected.category}</div>
                <div>{selected.branchesCount} branches</div>
                <div>Status: {selected.status}</div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <button
                  className="btn-primary"
                  onClick={() => updateStatus(selected.id, "APPROVED")}
                >
                  Approve Request
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => updateStatus(selected.id, "NEEDS_INFO")}
                >
                  Request More Information
                </button>

                <button
                  onClick={() => updateStatus(selected.id, "REJECTED")}
                  style={{
                    minHeight: "50px",
                    borderRadius: "18px",
                    color: "white",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #ff5c7a, #ff7a7a)",
                  }}
                >
                  Reject Request
                </button>
              </div>
            </>
          ) : (
            <div>No merchant request selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}
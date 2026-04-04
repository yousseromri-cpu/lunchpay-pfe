import { useEffect, useState } from "react";
import {
  getCompanyRequests,
  updateCompanyRequestStatus,
} from "../../services/platformStore";
import type {
  CompanyRequest,
  RequestStatus,
} from "../../services/platformStore";

export default function AdminCompanyRequests() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CompanyRequest | null>(null);

  useEffect(() => {
    const items = getCompanyRequests();
    setRequests(items);
    setSelectedRequest(items[0] || null);
  }, []);

  function updateStatus(id: string, status: RequestStatus) {
    const updated = updateCompanyRequestStatus(id, status);
    setRequests(updated);
    setSelectedRequest(updated.find((item) => item.id === id) || null);
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "10px" }}>
          Company Requests
        </h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
          Review company onboarding requests before granting access to LunchPay.
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
                <th>Company</th>
                <th>Contact</th>
                <th>Sector</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{request.id}</td>
                  <td>{request.companyName}</td>
                  <td>{request.contactName}</td>
                  <td>{request.sector}</td>
                  <td>{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-soft" style={{ padding: "20px", borderRadius: "24px" }}>
          {selectedRequest ? (
            <>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "16px" }}>
                {selectedRequest.companyName}
              </h3>

              <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                <div>{selectedRequest.workEmail}</div>
                <div>{selectedRequest.phone}</div>
                <div>{selectedRequest.country}</div>
                <div>{selectedRequest.city}</div>
                <div>{selectedRequest.employeesCount} employees</div>
                <div>Status: {selectedRequest.status}</div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <button
                  className="btn-primary"
                  onClick={() => updateStatus(selectedRequest.id, "APPROVED")}
                >
                  Approve Request
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => updateStatus(selectedRequest.id, "NEEDS_INFO")}
                >
                  Request More Information
                </button>

                <button
                  onClick={() => updateStatus(selectedRequest.id, "REJECTED")}
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
            <div>No company request selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}
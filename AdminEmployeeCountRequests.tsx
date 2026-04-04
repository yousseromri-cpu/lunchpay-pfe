import { useEffect, useState } from "react";
import {
  getEmployeeCountChangeRequests,
  updateEmployeeCountChangeRequestStatus,
} from "../../services/platformStore";
import type {
  EmployeeCountChangeRequest,
  EmployeeCountChangeStatus,
} from "../../services/platformStore";

export default function AdminEmployeeCountRequests() {
  const [requests, setRequests] = useState<EmployeeCountChangeRequest[]>([]);
  const [selected, setSelected] = useState<EmployeeCountChangeRequest | null>(null);

  useEffect(() => {
    const items = getEmployeeCountChangeRequests();
    setRequests(items);
    setSelected(items[0] || null);
  }, []);

  function updateStatus(id: string, status: EmployeeCountChangeStatus) {
    const updated = updateEmployeeCountChangeRequestStatus(id, status);
    setRequests(updated);
    setSelected(updated.find((item) => item.id === id) || null);
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "10px" }}>
          Employee Count Change Requests
        </h2>
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
          Review enterprise requests to update the official number of employees.
          Changes are only applied after administrator approval.
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
                <th>Current</th>
                <th>Requested</th>
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
                  <td>{item.companyName}</td>
                  <td>{item.currentEmployeesCount}</td>
                  <td>{item.requestedEmployeesCount}</td>
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
                {selected.companyName}
              </h3>

              <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                <div>Current count: {selected.currentEmployeesCount}</div>
                <div>Requested count: {selected.requestedEmployeesCount}</div>
                <div>Reason: {selected.reason || "—"}</div>
                <div>Requested at: {new Date(selected.requestedAt).toLocaleString()}</div>
                <div>Status: {selected.status}</div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <button
                  className="btn-primary"
                  onClick={() => updateStatus(selected.id, "APPROVED")}
                >
                  Approve Change
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
                  Reject Change
                </button>
              </div>
            </>
          ) : (
            <div>No employee count request selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}
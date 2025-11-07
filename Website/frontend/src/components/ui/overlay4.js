import React from "react";
import ReactDOM from "react-dom";
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

// Helper functions for date/time formatting
const formatDate = (isoString) => {
  if (!isoString || isoString === "N/A") return "N/A";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString || timeString === "N/A") return "N/A";
  if (timeString.includes(":")) {
    try {
      const [hours, minutes, seconds] = timeString.split(":");
      const date = new Date();
      date.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds || "0", 10)
      );
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {}
  }
  const date = new Date(timeString);
  if (!isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return timeString;
};

// Get status badge classes
const getStatusClasses = (status) => {
  switch (status) {
    case "Solved":
      return "bg-green-100 text-green-700";
    case "In-Action":
      return "bg-blue-100 text-blue-700";
    case "In-Review":
      return "bg-purple-100 text-purple-700";
    case "Received":
      return "bg-yellow-100 text-yellow-700";
    case "Pending":
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// PDF Download Function with Tailwind-inspired styling
const downloadPDF = (complaint, rowNumber) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const getStatusColor = (status) => {
    switch (status) {
      case "Solved":
        return { bg: "#d1fae5", color: "#065f46" };
      case "In-Action":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "In-Review":
        return { bg: "#e9d5ff", color: "#6b21a8" };
      case "Received":
        return { bg: "#fef3c7", color: "#92400e" };
      case "Pending":
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  const statusColor = getStatusColor(complaint.status);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Complaint Report #${rowNumber}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: system-ui, sans-serif;
            padding: 2rem;
          }
          .proof-section { background: #eff6ff; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #3b82f6; }
          .proof-label { color: #1e40af; font-weight: 600; margin-bottom: 0.5rem; }
          .proof-value { color: #1e3a8a; font-size: 0.75rem; word-break: break-all; }
        </style>
      </head>
      <body>
        <h1>Complaint Report #${rowNumber}</h1>
        <p><strong>Status:</strong> ${complaint.status}</p>
        <p><strong>Name:</strong> ${complaint.username}</p>
        <p><strong>Issue:</strong> ${complaint.types_of_issues}</p>

        ${
          complaint.proofs
            ? `
          <div class="proof-section">
            <div class="proof-label">Proof(s) Attached</div>
            <div class="proof-value">
              ${
                Array.isArray(complaint.proofs)
                  ? complaint.proofs
                      .map((url, i) => `<div>Proof ${i + 1}: ${url}</div>`)
                      .join("")
                  : String(complaint.proofs)
                      .split(",")
                      .map((url, i) => `<div>Proof ${i + 1}: ${url.trim()}</div>`)
                      .join("")
              }
            </div>
          </div>
          `
            : ""
        }

        <script>window.onload = function(){ window.print(); }</script>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};

// Main Overlay Component
const ComplaintSummaryModal = ({ complaint, onClose, rowNumber }) => {
  // Normalize proof list for display
  const proofList = Array.isArray(complaint.proofs)
    ? complaint.proofs
    : typeof complaint.proofs === "string"
    ? complaint.proofs.split(",").map((p) => p.trim())
    : [];

  return ReactDOM.createPortal(
    <div className="overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex flex-col">
            <div className="flex flex-row items-center space-x-3">
              <Image
                src={"/Beepney Logo (Website 2).svg"}
                width={40}
                height={40}
                alt="bp"
              />
              <h2 className="text-2xl font-bold text-[#073051]">
                Complaint Report #{rowNumber}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-2 px-14 ">
              Detailed summary and information
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Current Status
            </h3>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusClasses(
                complaint.status
              )}`}
            >
              {complaint.status}
            </span>
          </div>

          {/* Complainant Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Complainant Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Name</p>
                <p className="text-sm text-gray-900 mt-1">
                  {complaint.username}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Contact</p>
                <p className="text-sm text-gray-900 mt-1">
                  {complaint.contact_information}
                </p>
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Incident Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Type of Issue
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {complaint.types_of_issues}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm text-gray-900 mt-1">
                  {complaint.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Date of Incident
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(complaint.date_of_incident)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Time of Incident
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {formatTime(complaint.time_of_incident)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Description
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#073051]">
              <p className="text-sm text-gray-900 leading-relaxed">
                {complaint.description || "N/A"}
              </p>
            </div>
          </div>

          {/* Proofs Section */}
          {proofList.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Supporting Evidence
              </h3>
              <div className="flex flex-col space-y-2">
                {proofList.map((proof, i) => (
                  <button
                    key={i}
                    onClick={() => window.open(proof, "_blank")}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <EyeIcon className="h-5 w-5" />
                    <span>View Proof {i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submission Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Submission Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Submitted</span>
                <span className="text-sm text-gray-900 font-medium">
                  {formatDate(complaint.created_at)} at{" "}
                  {formatTime(complaint.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => downloadPDF(complaint, rowNumber)}
            className="px-5 py-2.5 bg-[#073051] text-white rounded-lg hover:bg-[#052440] transition-colors font-medium flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ComplaintSummaryModal;
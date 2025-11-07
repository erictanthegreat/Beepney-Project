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
    } catch (e) {
      // Fall through
    }
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
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 2.5rem;
            color: #1f2937;
            line-height: 1.625;
            background: white;
          }
          
          .container {
            max-width: 56rem;
            margin: 0 auto;
          }
          
          .header {
            border-bottom: 3px solid #073051;
            padding-bottom: 1.25rem;
            margin-bottom: 2rem;
          }
          
          .header h1 {
            color: #073051;
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          
          .header .subtitle {
            color: #6b7280;
            font-size: 0.875rem;
          }
          
          .section {
            margin-bottom: 2rem;
          }
          
          .section-title {
            color: #073051;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e5e7eb;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.875rem;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
          
          .info-item {
            margin-bottom: 0.5rem;
          }
          
          .info-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
          }
          
          .info-value {
            color: #1f2937;
            font-size: 0.875rem;
            font-weight: 400;
          }
          
          .status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            background: ${statusColor.bg};
            color: ${statusColor.color};
          }
          
          .description-box {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 4px solid #073051;
            color: #1f2937;
            font-size: 0.875rem;
            line-height: 1.625;
          }
          
          .timeline {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
          }
          
          .timeline-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
          }
          
          .timeline-item:not(:last-child) {
            border-bottom: 1px solid #e5e7eb;
          }
          
          .timeline-label {
            color: #6b7280;
            font-size: 0.875rem;
          }
          
          .timeline-value {
            color: #1f2937;
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          .footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.75rem;
            color: #9ca3af;
            text-align: center;
          }
          
          .proof-section {
            background: #eff6ff;
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 4px solid #3b82f6;
          }
          
          .proof-label {
            color: #1e40af;
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          
          .proof-value {
            color: #1e3a8a;
            font-size: 0.75rem;
            word-break: break-all;
          }
          
          @media print {
            body {
              padding: 1.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Complaint Report #${rowNumber}</h1>
            <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
          </div>

          <div class="section">
            <div class="section-title">Current Status</div>
            <span class="status-badge">${complaint.status}</span>
          </div>

          <div class="section">
            <div class="section-title">Complainant Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${complaint.username}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact</div>
                <div class="info-value">${complaint.contact_information}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Role</div>
                <div class="info-value">${complaint.role}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Incident Details</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Type of Issue</div>
                <div class="info-value">${complaint.types_of_issues}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">${complaint.location}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Incident</div>
                <div class="info-value">${formatDate(
                  complaint.date_of_incident
                )}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Time of Incident</div>
                <div class="info-value">${formatTime(
                  complaint.time_of_incident
                )}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Description</div>
            <div class="description-box">
              ${complaint.description || "N/A"}
            </div>
          </div>

          ${
            complaint.proofs
              ? `
          <div class="section">
            <div class="section-title">Supporting Evidence</div>
            <div class="proof-section">
              <div class="proof-label">Proof Attached: Yes</div>
              <div class="proof-value">${complaint.proofs}</div>
            </div>
          </div>
          `
              : ""
          }

          <div class="section">
            <div class="section-title">Submission Timeline</div>
            <div class="timeline">
              <div class="timeline-item">
                <span class="timeline-label">Submitted</span>
                <span class="timeline-value">${formatDate(
                  complaint.created_at
                )} at ${formatTime(complaint.created_at)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Complaint Management System - Confidential Document
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Main Overlay Component
const ComplaintSummaryModal = ({ complaint, onClose, rowNumber }) => {
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

          {/* Proof */}
          {complaint.proofs && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Supporting Evidence
              </h3>
              <button
                onClick={() => window.open(complaint.proofs, "_blank")}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <EyeIcon className="h-5 w-5" />
                <span>View Proof</span>
              </button>
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

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, Shield } from "lucide-react";

/**
 * CheatDetectionConsent - Modal for user consent before enabling cheat detection
 */
export const CheatDetectionConsent = ({ onAccept, onReject, sessionId }) => {
  const [accepted, setAccepted] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleAccept = () => {
    if (accepted) {
      onAccept(sessionId);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Interview Monitoring</h2>
          </div>
          <p className="text-blue-100 text-sm">
            We use video analysis to ensure interview integrity
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What We Monitor */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection("what")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">What We Monitor</h3>
              </div>
              <span
                className={`text-gray-500 transition ${expandedSection === "what" ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {expandedSection === "what" && (
              <div className="p-4 bg-gray-50 border-t space-y-3">
                <div className="flex gap-3">
                  <span className="text-blue-600 font-bold">📱</span>
                  <div>
                    <p className="font-medium text-gray-800">Phone Detection</p>
                    <p className="text-sm text-gray-600">
                      Detects if you're using a mobile device
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 font-bold">📚</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      Reference Materials
                    </p>
                    <p className="text-sm text-gray-600">
                      Detects visible books, notes, or documents
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 font-bold">👁️</span>
                  <div>
                    <p className="font-medium text-gray-800">Eye Movement</p>
                    <p className="text-sm text-gray-600">
                      Tracks if you're looking away from the screen excessively
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 font-bold">🎧</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      Suspicious Items
                    </p>
                    <p className="text-sm text-gray-600">
                      Detects earpieces or other suspicious devices
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Privacy */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection("privacy")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Your Privacy</h3>
              </div>
              <span
                className={`text-gray-500 transition ${expandedSection === "privacy" ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {expandedSection === "privacy" && (
              <div className="p-4 bg-gray-50 border-t space-y-3 text-sm text-gray-700">
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Video frames are NOT stored or recorded</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Only detection results and metadata are saved</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Data is encrypted in transit and at rest</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>You can review and appeal any detected issues</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      All monitoring complies with data protection regulations
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <p>
                Occasional false positives may occur. If flagged unfairly, you
                can appeal the decision and our team will review it manually.
              </p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="border-t pt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <span className="text-gray-700 text-sm">
                I understand and agree to the monitoring of my video during this
                interview. I confirm that I have read and understood the privacy
                notice above.
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
          <button
            onClick={() => onReject(sessionId)}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Decline & Exit
          </button>
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              accepted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * PrivacyNoticeFooter - Minimal privacy notice for persistent display
 */
export const PrivacyNoticeFooter = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 hover:text-gray-800 transition"
      >
        <Shield className="w-4 h-4" />
        <span>Privacy Notice: Video monitoring enabled</span>
        <span className={`ml-auto transition ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="mt-3 p-3 bg-white rounded border border-gray-200 space-y-2">
          <p className="font-medium text-gray-700">
            Video Analysis Disclaimer:
          </p>
          <ul className="space-y-1">
            <li>
              • Video frames are analyzed in real-time for interview integrity
            </li>
            <li>• Raw video is NOT recorded or stored</li>
            <li>• Only detection metadata is retained</li>
            <li>• You can appeal any detected issues</li>
          </ul>
          <p className="text-gray-500 pt-2">
            For details, see our Privacy Policy and Terms of Service.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";

/**
 * CheatWarningBanner - Display real-time warnings about detected suspicious activity
 */
export const CheatWarningBanner = ({ warnings, onDismiss }) => {
  const [visible, setVisible] = useState(warnings && warnings.length > 0);

  useEffect(() => {
    setVisible(warnings && warnings.length > 0);

    // Auto-dismiss after 5 seconds
    if (warnings && warnings.length > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [warnings]);

  if (!visible || !warnings || warnings.length === 0) {
    return null;
  }

  const latestWarning = warnings[0];

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 border-red-400 text-red-800";
      case "warning":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "info":
        return "bg-blue-100 border-blue-400 text-blue-800";
      default:
        return "bg-gray-100 border-gray-400 text-gray-800";
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss(latestWarning.type);
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 md:right-auto md:max-w-md rounded-lg border-l-4 p-4 shadow-lg animate-in fade-in ${getSeverityStyles(latestWarning.severity)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getIcon(latestWarning.severity)}
          <div>
            <p className="font-semibold">{latestWarning.message}</p>
            <p className="text-sm opacity-75 mt-1">
              {latestWarning.type.replace(/_/g, " ").toUpperCase()}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * RiskIndicatorDashboard - Display real-time risk scores
 */
export const RiskIndicatorDashboard = ({ detections }) => {
  const [latestDetection, setLatestDetection] = useState(null);

  useEffect(() => {
    if (detections && detections.length > 0) {
      setLatestDetection(detections[detections.length - 1]);
    }
  }, [detections]);

  if (!latestDetection) {
    return null;
  }

  const { risks, riskLevel } = latestDetection;

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return "bg-red-500";
    if (riskScore >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const RiskIndicator = ({ label, score }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 rounded-full border-4 border-gray-300 flex items-center justify-center bg-gray-50">
        <div
          className={`absolute inset-0 rounded-full ${getRiskColor(score)} opacity-30`}
        />
        <div className="relative text-center">
          <p className="font-bold text-sm">{score}</p>
          <p className="text-xs text-gray-500">%</p>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-700 mt-2 text-center">
        {label}
      </p>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Risk Assessment</h3>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${getRiskLevelColor(riskLevel)} bg-gray-100`}
        >
          {riskLevel.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <RiskIndicator label="Phone" score={risks.phone || 0} />
        <RiskIndicator label="Books" score={risks.book || 0} />
        <RiskIndicator label="Eye Gaze" score={risks.gaze_deviation || 0} />
        <RiskIndicator label="Attire" score={risks.attire || 0} />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Overall Risk
          </span>
          <span className={`text-lg font-bold ${getRiskColor(risks.overall)}`}>
            {risks.overall || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getRiskColor(risks.overall)}`}
            style={{ width: `${risks.overall || 0}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

/**
 * CheatIndicatorBadge - Small badge to show if any suspicious activity is detected
 */
export const CheatIndicatorBadge = ({ detections, className = "" }) => {
  const [hasWarnings, setHasWarnings] = useState(false);

  useEffect(() => {
    if (detections && detections.length > 0) {
      const latest = detections[detections.length - 1];
      const hasAnyFlags =
        latest.flags && Object.values(latest.flags).some((v) => v);
      setHasWarnings(hasAnyFlags);
    }
  }, [detections]);

  if (!hasWarnings) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium ${className}`}
    >
      <AlertCircle className="w-4 h-4" />
      <span>Suspicious Activity Detected</span>
    </div>
  );
};

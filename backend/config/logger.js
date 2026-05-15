const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message, data = "") => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] INFO: ${message} ${data}`;
    console.log(logMsg);
  },

  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    const logMsg = `[${timestamp}] ERROR: ${message} - ${errorMsg}`;
    console.error(logMsg);

    // Also log to file
    try {
      fs.appendFileSync(path.join(logsDir, "error.log"), logMsg + "\n");
    } catch (e) {
      console.error("Failed to write to error log:", e);
    }
  },

  warn: (message, data = "") => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] WARN: ${message} ${data}`;
    console.warn(logMsg);
  },

  debug: (message, data = "") => {
    if (process.env.DEBUG === "true") {
      const timestamp = new Date().toISOString();
      const logMsg = `[${timestamp}] DEBUG: ${message} ${JSON.stringify(data)}`;
      console.debug(logMsg);
    }
  },
};

module.exports = logger;

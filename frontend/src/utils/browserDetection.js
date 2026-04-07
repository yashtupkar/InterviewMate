/**
 * Browser Detection Utility for Hybrid TTS Strategy
 * Detects browser type and device to determine TTS backend
 */

/**
 * Check if browser is Chrome (excluding Chromium-based browsers like Brave, Edge, etc.)
 * IMPORTANT: Check for other Chromium browsers FIRST since they contain "Chrome" in UA
 * @returns {boolean}
 */
export const isChrome = () => {
  const userAgent = navigator.userAgent;

  // Check for Brave FIRST (most important exclusion)
  if (isBrave()) {
    return false;
  }

  // Check for Edge (Chromium-based)
  if (/Edg/.test(userAgent)) {
    return false;
  }

  // Check for Opera (Chromium-based)
  if (/OPR|Opera/.test(userAgent)) {
    return false;
  }

  // Check for Vivaldi (Chromium-based)
  if (/Vivaldi/.test(userAgent)) {
    return false;
  }

  // Only if none of the above, check for actual Chrome
  return /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
};

/**
 * Check if device is desktop (not mobile/tablet)
 * @returns {boolean}
 */
export const isDesktop = () => {
  // Check userAgentData if available (modern browsers)
  if (navigator.userAgentData?.mobile === false) {
    return true;
  }

  // Fallback: check userAgent string
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
      navigator.userAgent,
    );

  return !isMobile;
};

/**
 * Check if browser is Brave
 * Brave is Chromium-based but has distinct detection methods
 * @returns {boolean}
 */
export const isBrave = () => {
  // Method 1: Check for navigator.brave (Brave-specific property)
  if (navigator.brave && navigator.brave.isBrave) {
    return true;
  }

  // Method 2: Check userAgent for "Brave"
  if (/Brave/.test(navigator.userAgent)) {
    return true;
  }

  // Method 3: Check for Brave-specific extensions or features
  // Brave often has different behavior in certain APIs
  return false;
};

/**
 * Check if browser is Firefox
 * @returns {boolean}
 */
export const isFirefox = () => {
  return /Firefox/.test(navigator.userAgent);
};

/**
 * Check if browser is Safari
 * @returns {boolean}
 */
export const isSafari = () => {
  return (
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent) &&
    !/Chromium/.test(navigator.userAgent)
  );
};

/**
 * Check if browser is Edge
 * @returns {boolean}
 */
export const isEdge = () => {
  return /Edg/.test(navigator.userAgent);
};

/**
 * Check if should use browser native TTS
 * Strategy: Use browser native TTS for Chrome Desktop only
 * Reason: Chrome native TTS is instant, free, and good quality for this use case
 * Fallback: AWS Polly for all other browsers/devices
 * @returns {boolean}
 */
export const shouldUseBrowserNativeTTS = () => {
  const useBrowserTTS = isChrome() && isDesktop();
  return useBrowserTTS;
};

/**
 * Get browser name for logging
 * @returns {string}
 */
export const getBrowserName = () => {
  if (isChrome()) return "Chrome";
  if (isBrave()) return "Brave";
  if (isEdge()) return "Edge";
  if (isFirefox()) return "Firefox";
  if (isSafari()) return "Safari";
  return "Other";
};

/**
 * Get device type for logging
 * @returns {string}
 */
export const getDeviceType = () => {
  if (!isDesktop()) return "Mobile";
  return "Desktop";
};

/**
 * Log TTS backend selection for debugging
 * @returns {void}
 */
export const logTTSBackendSelection = () => {
  const userAgent = navigator.userAgent;
  const backend = shouldUseBrowserNativeTTS() ? "Browser Native" : "AWS Polly";
  const browser = getBrowserName();
  const device = getDeviceType();

  // Diagnostic logging
  const diagnostic = {
    userAgent: userAgent.substring(0, 100) + "...",
    isChrome: isChrome(),
    isBrave: isBrave(),
    isEdge: isEdge(),
    isFirefox: isFirefox(),
    isSafari: isSafari(),
    isDesktop: isDesktop(),
    backend: backend,
    browser: browser,
  };

  console.info(`🎙️ TTS Backend: ${backend} (${browser} on ${device})`);
  console.debug("Browser Detection Diagnostic:", diagnostic);
};

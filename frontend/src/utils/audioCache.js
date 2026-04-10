/**
 * IndexedDB Audio Cache Manager
 * Stores TTS audio locally for faster playback and offline support
 */

const DB_NAME = "InterviewMateAudioCache";
const DB_VERSION = 1;
const STORE_NAME = "audio_cache";
const CACHE_EXPIRY_DAYS = 30; // Cache for 30 days

let dbInstance = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
export const initDB = async () => {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB initialization failed");
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "cacheId" });
        // Create index for searching by text + voiceId
        store.createIndex("textVoiceIndex", "textVoiceKey", { unique: true });
        // Create index for expiry time (for cleanup)
        store.createIndex("expiryIndex", "expiresAt", { unique: false });
      }
    };
  });
};

/**
 * Save audio to cache
 * @param {string} cacheId - Unique cache ID
 * @param {string} text - Original text
 * @param {string} voiceId - Voice ID used
 * @param {Blob|ArrayBuffer} audioData - Audio data
 * @returns {Promise<string>} Cache ID
 */
export const saveAudio = async (cacheId, text, voiceId, audioData) => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_EXPIRY_DAYS);

    const cacheEntry = {
      cacheId,
      text,
      voiceId,
      audioData: audioData instanceof Blob ? audioData : new Blob([audioData]),
      textVoiceKey: `${text}:${voiceId}`,
      createdAt: new Date(),
      expiresAt,
      size: audioData.size || audioData.byteLength || 0,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve(cacheId);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error saving audio to cache:", error);
    throw error;
  }
};

/**
 * Get audio from cache
 * @param {string} cacheId
 * @returns {Promise<Blob|null>} Audio data or null
 */
export const getAudio = async (cacheId) => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(cacheId);
      request.onsuccess = () => {
        const entry = request.result;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache has expired
        if (new Date() > entry.expiresAt) {
          // Cache expired, delete it
          deleteAudio(cacheId);
          resolve(null);
          return;
        }

        resolve(entry.audioData);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error retrieving audio from cache:", error);
    return null;
  }
};

/**
 * Get audio by text and voice ID
 * @param {string} text
 * @param {string} voiceId
 * @returns {Promise<{cacheId: string, audio: Blob}|null>}
 */
export const getAudioByTextAndVoice = async (text, voiceId) => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME);
    const index = store.index("textVoiceIndex");
    const textVoiceKey = `${text}:${voiceId}`;

    return new Promise((resolve, reject) => {
      const request = index.get(textVoiceKey);
      request.onsuccess = () => {
        const entry = request.result;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache has expired
        if (new Date() > entry.expiresAt) {
          deleteAudio(entry.cacheId);
          resolve(null);
          return;
        }

        resolve({
          cacheId: entry.cacheId,
          audio: entry.audioData,
        });
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error retrieving audio by text and voice:", error);
    return null;
  }
};

/**
 * Delete audio from cache
 * @param {string} cacheId
 * @returns {Promise<boolean>}
 */
export const deleteAudio = async (cacheId) => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(cacheId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error deleting audio from cache:", error);
    return false;
  }
};

/**
 * Clear all cache
 * @returns {Promise<void>}
 */
export const clearAllCache = async () => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    throw error;
  }
};

/**
 * Clean up expired cache entries
 * @returns {Promise<number>} Number of entries deleted
 */
export const cleanupExpiredCache = async () => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME);
    const index = store.index("expiryIndex");
    const now = new Date();

    const range = IDBKeyRange.upperBound(now);
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error cleaning up expired cache:", error);
    return 0;
  }
};

/**
 * Get cache size
 * @returns {Promise<{count: number, totalSize: number, totalSizeMB: number}>}
 */
export const getCacheSize = async () => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result;
        let totalSize = 0;

        entries.forEach((entry) => {
          totalSize += entry.size || 0;
        });

        resolve({
          count: entries.length,
          totalSize,
          totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        });
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting cache size:", error);
    return {
      count: 0,
      totalSize: 0,
      totalSizeMB: "0.00",
    };
  }
};

/**
 * Get all cached entries (for debugging)
 * @returns {Promise<Array>}
 */
export const getAllCachedEntries = async () => {
  try {
    const db = await initDB();
    const store = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result.map((entry) => ({
          cacheId: entry.cacheId,
          text: entry.text,
          voiceId: entry.voiceId,
          size: entry.size,
          createdAt: entry.createdAt,
          expiresAt: entry.expiresAt,
        }));
        resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting all cached entries:", error);
    return [];
  }
};

/**
 * Convert audio Blob to base64
 * @param {Blob} blob
 * @returns {Promise<string>} Base64 string
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert base64 to Blob
 * @param {string} base64 - Can be raw base64 or data URL format (data:audio/mpeg;base64,...)
 * @returns {Blob}
 */
export const base64ToBlob = (base64, contentType = "audio/mpeg") => {
  try {
    // Handle both raw base64 and data URL formats
    let binaryString;

    if (base64.includes(",")) {
      // Data URL format: "data:audio/mpeg;base64,SUQzBAA..."
      const parts = base64.split(",");
      binaryString = atob(parts[1]);
    } else {
      // Raw base64 format: "SUQzBAA..."
      binaryString = atob(base64);
    }

    const n = binaryString.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = binaryString.charCodeAt(i);
    }

    return new Blob([u8arr], { type: contentType });
  } catch (error) {
    console.error("Error converting base64 to Blob:", error);
    throw new Error(`Failed to decode audio: ${error.message}`);
  }
};

// Cleanup expired cache periodically (every hour)
if (typeof window !== "undefined") {
  setInterval(cleanupExpiredCache, 60 * 60 * 1000);
}

export default {
  initDB,
  saveAudio,
  getAudio,
  getAudioByTextAndVoice,
  deleteAudio,
  clearAllCache,
  cleanupExpiredCache,
  getCacheSize,
  getAllCachedEntries,
  blobToBase64,
  base64ToBlob,
};

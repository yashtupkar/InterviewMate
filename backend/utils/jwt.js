const crypto = require("crypto");

/**
 * Creates a signed JWT token
 * @param {Object} payload - Data to encode
 * @param {String} secret - Secret key for HMAC
 * @param {String} expiresIn - Expiry time (e.g. '24h')
 * @returns {String} JWT token
 */
const sign = (payload, secret, expiresIn = "24h") => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  
  // Calculate expiry timestamp
  const hours = parseInt(expiresIn) || 24;
  const exp = Math.floor(Date.now() / 1000) + (hours * 60 * 60);
  
  const encodedPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedHeader + "." + encodedPayload)
    .digest("base64url");
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Verifies and decodes a JWT token
 * @param {String} token - The JWT token
 * @param {String} secret - Secret key for HMAC
 * @returns {Object} The decoded payload
 * @throws {Error} If invalid signature or expired
 */
const verify = (token, secret) => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  
  const [header, payload, signature] = parts;
  
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(header + "." + payload)
    .digest("base64url");
    
  if (signature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }
  
  const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  
  if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  
  return decodedPayload;
};

module.exports = { sign, verify };

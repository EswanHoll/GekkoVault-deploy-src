import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
/**
 * Bootstrap master key for encrypting vault values at rest.
 * Production: set VAULT_MASTER_KEY (the one bootstrap secret).
 * Preview: process-stable derived key so HMR doesn't rotate ciphertext.
 */
function getMasterKey(): Buffer {
  const g = globalThis as typeof globalThis & { __vaultMasterKey__?: Buffer };
  if (g.__vaultMasterKey__) return g.__vaultMasterKey__;
  const fromEnv =
    typeof process !== "undefined" ? process.env.VAULT_MASTER_KEY?.trim() : undefined;
  const material =
    fromEnv && fromEnv.length >= 16
      ? fromEnv
      : "preview-only-bootstrap-key-not-for-production";
  const key = scryptSync(material, "gekko-secrets-broker-v1", 32);
  g.__vaultMasterKey__ = key;
  return key;
}
export function encryptSecret(plaintext: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getMasterKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([enc, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}
export function decryptSecret(ciphertext: string, iv: string): string {
  const raw = Buffer.from(ciphertext, "base64");
  const data = raw.subarray(0, raw.length - 16);
  const tag = raw.subarray(raw.length - 16);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getMasterKey(),
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
export function mintToolToken(): { token: string; prefix: string; hash: string } {
  const token = `sb_${randomBytes(24).toString("base64url")}`;
  return { token, prefix: token.slice(0, 10), hash: hashToken(token) };
}
export function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(10).toString("hex")}`;
}

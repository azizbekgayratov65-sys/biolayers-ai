import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

import { getGeminiEncryptionKey } from "../env";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const IV_BYTES = 12;

/*
  Derives a 32-byte AES key from GEMINI_ENCRYPTION_KEY.

  - A 64-character hex string is used directly as a 32-byte key.
  - Any other value is hashed (SHA-256) into a deterministic key.

  The encryption key is a server-only environment variable and is
  never exposed to the client.
*/
function deriveKey(): Buffer {
  const raw = getGeminiEncryptionKey();

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  return createHash("sha256").update(raw).digest();
}

/*
  Encrypts a Gemini API key. Returns a versioned, self-contained
  payload: v1:<iv b64>:<auth tag b64>:<ciphertext b64>.
*/
export function encryptApiKey(plaintext: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/*
  Decrypts a payload produced by encryptApiKey. Throws if the key,
  IV or authentication tag are invalid (tampering is detected).
*/
export function decryptApiKey(payload: string): string {
  const parts = payload.split(":");

  if (
    parts.length !== 4 ||
    parts[0] !== VERSION
  ) {
    throw new Error(
      "Unsupported encrypted API key payload.",
    );
  }

  const [, ivBase64, tagBase64, dataBase64] =
    parts;

  const key = deriveKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivBase64, "base64"),
  );

  decipher.setAuthTag(
    Buffer.from(tagBase64, "base64"),
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(dataBase64, "base64"),
    ),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/*
  Produces a non-secret display string such as
  "••••••••••••••••ABCD" for the settings UI.
*/
export function maskApiKey(plaintext: string): string {
  const trimmed = plaintext.trim();

  if (trimmed.length <= 4) {
    return "••••••••••••••••";
  }

  return `••••••••••••••••${trimmed.slice(-4)}`;
}
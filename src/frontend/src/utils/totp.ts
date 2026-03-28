// Base32 decoder (RFC 4648)
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function decodeBase32(input: string): Uint8Array {
  const str = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (const char of str) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      bytes.push((buffer >> bitsLeft) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

// TOTP generation using Web Crypto API
export async function generateTOTP(
  secret: string,
  timeStep = 30,
): Promise<string> {
  const keyBytes = decodeBase32(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStep);

  // Encode counter as 8-byte big-endian
  const counterBytes = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = c & 0xff;
    c = Math.floor(c / 256);
  }

  // Import key for HMAC-SHA1 — use .buffer and cast to ArrayBuffer
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  // Compute HMAC-SHA1
  const signature = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    counterBytes.buffer as ArrayBuffer,
  );
  const hmac = new Uint8Array(signature);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1_000_000;

  const str = code.toString().padStart(6, "0");
  return `${str.slice(0, 3)} ${str.slice(3)}`;
}

export function getCountdown(timeStep = 30): number {
  return timeStep - (Math.floor(Date.now() / 1000) % timeStep);
}

export function parseOtpauthUri(uri: string): {
  secret: string;
  accountName: string;
  issuer: string;
} | null {
  try {
    if (!uri.startsWith("otpauth://totp/")) return null;
    const withoutScheme = uri.slice("otpauth://totp/".length);
    const [labelRaw, queryRaw] = withoutScheme.split("?");
    const label = decodeURIComponent(labelRaw);
    const params = new URLSearchParams(queryRaw);

    const secret = params.get("secret") ?? "";
    const issuerParam = params.get("issuer") ?? "";

    let accountName = label;
    let issuer = issuerParam;

    if (label.includes(":")) {
      const parts = label.split(":");
      issuer = issuer || parts[0].trim();
      accountName = parts[1].trim();
    }

    return { secret, accountName, issuer };
  } catch {
    return null;
  }
}

const ACCOUNTS_KEY = "safar2you.vendor.accounts";
const LOCAL_SESSION_KEY = "safar2you.vendor.session";
const SESSION_KEY = "safar2you.vendor.session.temporary";
const PASSWORD_ITERATIONS = 120_000;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) {
    throw new Error("Secure password hashing is unavailable in this browser.");
  }

  const key = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return bytesToHex(new Uint8Array(hash));
}

function readAccounts() {
  const stored = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!stored) return [];

  try {
    const accounts = JSON.parse(stored);
    if (!Array.isArray(accounts)) throw new Error();
    return accounts;
  } catch {
    throw new Error(
      "Saved local account data is invalid. Clear this app's local storage and register again.",
    );
  }
}

export async function createLocalVendorAccount(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("An account with this email already exists. Please sign in.");
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const saltHex = bytesToHex(salt);
  const passwordHash = await hashPassword(password, salt);
  accounts.push({
    email: normalizedEmail,
    salt: saltHex,
    passwordHash,
    iterations: PASSWORD_ITERATIONS,
  });
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function signInLocalVendor(email, password, rememberMe) {
  const normalizedEmail = normalizeEmail(email);
  const account = readAccounts().find(
    (savedAccount) => savedAccount.email === normalizedEmail,
  );

  if (!account) return false;

  const salt = new Uint8Array(
    account.salt.match(/.{1,2}/g).map((byte) => Number.parseInt(byte, 16)),
  );
  const candidateHash = await hashPassword(password, salt);
  if (candidateHash !== account.passwordHash) return false;

  window.localStorage.removeItem(LOCAL_SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
  if (rememberMe) {
    window.localStorage.setItem(LOCAL_SESSION_KEY, normalizedEmail);
  } else {
    window.sessionStorage.setItem(SESSION_KEY, normalizedEmail);
  }
  return true;
}

export function hasLocalVendorSession() {
  return Boolean(
    window.localStorage.getItem(LOCAL_SESSION_KEY) ||
      window.sessionStorage.getItem(SESSION_KEY),
  );
}

export function signOutLocalVendor() {
  window.localStorage.removeItem(LOCAL_SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

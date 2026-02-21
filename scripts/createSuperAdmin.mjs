import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";

// --------------------
// Tiny CLI args parser (no dependency)
// --------------------
function getArg(name) {
  const idx = process.argv.findIndex((a) => a === `--${name}`);
  if (idx === -1) return null;
  const next = process.argv[idx + 1];
  if (!next || next.startsWith("--")) return "";
  return next;
}

const EMAIL = getArg("email") || process.env.ADMIN_EMAIL || "admin@domain.com";
const PASSWORD = getArg("password") || process.env.ADMIN_PASSWORD || "admin12345";
const DISPLAY_NAME = getArg("name") || process.env.ADMIN_NAME || "Admin";
const ROLE = getArg("role") || process.env.ADMIN_ROLE || "super_admin";

// Allow overriding key path via --key or GOOGLE_APPLICATION_CREDENTIALS
const SERVICE_ACCOUNT_PATH =
  getArg("key") ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.resolve(process.cwd(), "secrets/firebase-admin-service-account.json");

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  die(
    `Service account file not found:\n  ${SERVICE_ACCOUNT_PATH}\n\n` +
      `Fix:\n` +
      `- Put it at: secrets/firebase-admin-service-account.json\n` +
      `- OR run with: --key "C:\\path\\to\\key.json"\n` +
      `- OR set GOOGLE_APPLICATION_CREDENTIALS`,
  );
}

const raw = fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8").trim();
if (!raw) {
  die(
    `Service account JSON is EMPTY:\n  ${SERVICE_ACCOUNT_PATH}\n\n` +
      `Fix:\n` +
      `- Re-download it from Firebase Console → Project Settings → Service Accounts → Generate new private key`,
  );
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch (e) {
  die(
    `Service account JSON is INVALID (cannot parse):\n  ${SERVICE_ACCOUNT_PATH}\n\n` +
      `Fix:\n` +
      `- Re-download the JSON key (don’t copy/paste)\n` +
      `- Ensure file starts with "{" and ends with "}"`,
  );
}

// --------------------
// Init Admin SDK
// --------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function main() {
  if (!EMAIL || !PASSWORD) die("Email and password are required.");

  let userRecord;

  try {
    userRecord = await auth.getUserByEmail(EMAIL);
    console.log(`ℹ️  User exists: ${EMAIL} (uid=${userRecord.uid})`);
  } catch {
    userRecord = await auth.createUser({
      email: EMAIL,
      password: PASSWORD,
      displayName: DISPLAY_NAME,
      emailVerified: true,
      disabled: false,
    });
    console.log(`✅ Created user: ${EMAIL} (uid=${userRecord.uid})`);
  }

  await auth.setCustomUserClaims(userRecord.uid, { role: ROLE });
  console.log(`✅ Set custom claims: { role: "${ROLE}" }`);

  // Optional Firestore profile for your Users module later
  await db.collection("users").doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email: EMAIL,
      displayName: userRecord.displayName || DISPLAY_NAME,
      role: ROLE,
      status: "active",
      verified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`✅ Upserted Firestore profile: users/${userRecord.uid}`);

  console.log(
    `\n✅ DONE\nLogin:\n  Email: ${EMAIL}\n  Password: ${PASSWORD}\n\n` +
      `Note: If you were logged in before, logout/login again to refresh token claims.\n`,
  );
}

main().catch((err) => {
  console.error("\n❌ Script failed:", err?.message || err);
  process.exit(1);
});
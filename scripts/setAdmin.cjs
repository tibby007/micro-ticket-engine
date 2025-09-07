// One-time: set isAdmin=true for your account
// Usage:
//   export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
//   node scripts/setAdmin.cjs
// Note: Requires firebase-admin to be installed and a valid service account JSON at repo root.

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp({ credential: applicationDefault() });

async function run() {
  const email = process.env.ADMIN_EMAIL || 'support@emergestack.dev';
  const user = await getAuth().getUserByEmail(email);
  const existing = user.customClaims || {};
  await getAuth().setCustomUserClaims(user.uid, { ...existing, isAdmin: true });
  console.log(`isAdmin=true set for ${email} (${user.uid})`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


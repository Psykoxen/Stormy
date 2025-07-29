import { getFireAlerts, upsertFireAlerts } from "../lib/fire-alerts.js";

try {
  const alerts = await getFireAlerts();
  await upsertFireAlerts(alerts);
  console.log("✅ Alerts up to date with success");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}

import axios from "axios";
import {
  getWeatherAlertStarting,
  getWeatherAlertsEnding,
} from "../lib/weather-alerts.js";
import { getWebhooksWithFilters } from "../lib/webhooks.js";

const tomorrow = new Date(Date.now() + 86400000);
const tomorrow_long = tomorrow.toLocaleDateString("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

try {
  await notifyEndingWeatherAlerts();
  await notifyStartingWeatherAlerts();
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}

function formatStartingAlertMessage(alert) {
  let emoji = "⚪";
  let exaColor = "#ffffff";
  let colorLabel = "Inconnu";

  switch (alert.color.toLowerCase()) {
    case "vert":
      emoji = "🟢";
      exaColor = "#00ff00";
      colorLabel = "VIGILANCE VERTE";
      break;
    case "jaune":
      emoji = "🟡";
      exaColor = "#ffff00";
      colorLabel = "VIGILANCE JAUNE";
      break;
    case "orange":
      emoji = "🟠";
      exaColor = "#ff7f00";
      colorLabel = "VIGILANCE ORANGE";
      break;
    case "rouge":
      emoji = "🔴";
      exaColor = "#ff0000";
      colorLabel = "VIGILANCE ROUGE";
      break;
  }

  return `${emoji} <font color="${exaColor}"><b>${colorLabel}</b></font> pour <b>${
    alert.name
  }</b><br><i>Fin prévue le ${new Date(alert.endtime).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}</i>`;
}

function formatEndingAlertMessage(alert) {
  let emoji = "⚪";
  let exaColor = "#ffffff";
  let colorLabel = "Inconnu";

  switch (alert.color.toLowerCase()) {
    case "vert":
      emoji = "🟢";
      exaColor = "#00ff00";
      colorLabel = "VIGILANCE VERTE";
      break;
    case "jaune":
      emoji = "🟡";
      exaColor = "#ffff00";
      colorLabel = "VIGILANCE JAUNE";
      break;
    case "orange":
      emoji = "🟠";
      exaColor = "#ff7f00";
      colorLabel = "VIGILANCE ORANGE";
      break;
    case "rouge":
      emoji = "🔴";
      exaColor = "#ff0000";
      colorLabel = "VIGILANCE ROUGE";
      break;
  }

  return `${emoji} <font color="${exaColor}"><b>${colorLabel}</b></font> pour <b>${alert.name}</b>`;
}

async function notifyStartingWeatherAlerts() {
  const alerts = await getWeatherAlertStarting();
  console.log("Starting weather alerts:", alerts);

  if (!alerts || alerts.length === 0) {
    console.log("No starting weather alerts found.");
    process.exit(0);
  }

  const webhooks = await getWebhooksWithFilters({ warning_alerts: true });
  for (const webhook of webhooks) {
    const deptCodes = webhook.dept_code || [];
    const alertsToSend = alerts.filter((alert) =>
      deptCodes.includes(alert.code)
    );

    for (const alert of alertsToSend) {
      await axios.post(webhook.url, {
        cardsV2: [
          {
            cardId: "alert-card",
            card: {
              header: {
                title: `📢 Début de vigilance météorologique - ${alert.dpt} (${alert.code})`,
              },
              sections: [
                {
                  widgets: [
                    {
                      textParagraph: {
                        text: formatStartingAlertMessage(alert),
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      });
    }
  }
}

async function notifyEndingWeatherAlerts() {
  const alerts = await getWeatherAlertsEnding();
  console.log("Ending weather alerts:", alerts);

  if (!alerts || alerts.length === 0) {
    console.log("No ending weather alerts found.");
    process.exit(0);
  }

  const webhooks = await getWebhooksWithFilters({ warning_alerts: true });
  for (const webhook of webhooks) {
    const deptCodes = webhook.dept_code || [];
    const alertsToSend = alerts.filter((alert) =>
      deptCodes.includes(alert.code)
    );

    for (const alert of alertsToSend) {
      await axios.post(webhook.url, {
        cardsV2: [
          {
            cardId: "alert-card",
            card: {
              header: {
                title: `🔔 Fin de vigilance météorologique - ${alert.dpt} (${alert.code})`,
              },
              sections: [
                {
                  widgets: [
                    {
                      textParagraph: {
                        text: formatEndingAlertMessage(alert),
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      });
    }
  }
}

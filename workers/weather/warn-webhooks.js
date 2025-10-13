import axios from "axios";
import { getWeatherAlertStartingInDelay } from "../lib/weather-alerts.js";
import { getWebhooksWithFilters } from "../lib/webhooks.js";

try {
  await notifyNext12HoursWeatherAlerts();
} catch (err) {
  console.error("❌ Error:", err.message, err.stack);
  process.exit(1);
}

function formatRecapAlertMessage(alerts) {
  const messages = [];
  for (const alert of alerts) {
    let emoji = "⚪";
    let exaColor = "#ffffff";
    let colorLabel = "Inconnu";

    switch (alert.color.toLowerCase()) {
      case "vert":
        emoji = "🟢";
        exaColor = "#4cbe87";
        colorLabel = "VIGILANCE VERTE";
        break;
      case "jaune":
        emoji = "🟡";
        exaColor = "#ecba49";
        colorLabel = "VIGILANCE JAUNE";
        break;
      case "orange":
        emoji = "🟠";
        exaColor = "#fc824e";
        colorLabel = "VIGILANCE ORANGE";
        break;
      case "rouge":
        emoji = "🔴";
        exaColor = "#d63a4e";
        colorLabel = "VIGILANCE ROUGE";
        break;
    }

    messages.push(
      `${emoji} <font color="${exaColor}"><b>${colorLabel}</b></font> pour <b>${
        alert.name
      }</b><br><i>De ${new Date(alert.starttime).toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} à ${new Date(alert.endtime).toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}</i>`
    );
  }
  return messages;
}

async function notifyNext12HoursWeatherAlerts() {
  const alerts = await getWeatherAlertStartingInDelay(12 * 60 * 60 * 1000);
  if (!alerts || alerts.length === 0) {
    return;
  }

  const webhooks = await getWebhooksWithFilters({ warning_alerts: true });
  for (const webhook of webhooks) {
    const deptCodes = webhook.dept_code || [];
    const alertsToSend = alerts.filter((alert) =>
      deptCodes.includes(alert.code)
    );

    if (alertsToSend.length === 0) {
      continue;
    }

    try {
      await axios.post(webhook.url, {
        cardsV2: [
          {
            cardId: "alert-card",
            card: {
              header: {
                title: `⏰ Vigilances prévues durant les 12 prochaines heures`,
                subtitle: `Département concerné : ${alertsToSend[0].dpt} (${alertsToSend[0].code})`,
              },
              sections: formatRecapAlertMessage(alertsToSend).map(
                (message) => ({
                  widgets: [
                    {
                      textParagraph: {
                        text: message,
                      },
                    },
                  ],
                })
              ),
            },
          },
        ],
      });
    } catch (error) {
      console.error(
        `❌ Erreur lors de l'envoi de l'alerte pour le département ${alertsToSend[0].code} :`,
        error.message,
        error.stack
      );
    }
  }
}

console.log(`Chargement des alertes météo...`);
import dotenv from "dotenv";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";

dotenv.config();

export async function sendEmail(
  recipients_email,
  recipients_name,
  subject,
  content
) {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILER_API_KEY,
  });

  const sentFrom = new Sender(
    "test@test-xkjn41m7jq64z781.mlsender.net",
    "Stormy Fire Alerts"
  );

  const recipients = [new Recipient(recipients_email, recipients_name)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(content);

  return await mailerSend.email.send(emailParams);
}

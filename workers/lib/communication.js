import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.MAILER_API_KEY);

export async function sendEmail(recipients_email, subject, content) {
  const { data, error } = await resend.emails.send({
    from: "Stormy Alerts <alerts@stormy.avoillot.com>",
    to: [recipients_email],
    subject: subject,
    html: content,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}

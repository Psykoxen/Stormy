import { readBody } from "h3";

interface RequestBody {
  mode: "email" | "webhook";
  url?: string;
  email?: string;
  dept_code: string[];
  warning_alerts: boolean;
  fire_alerts: boolean;
}

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export default defineEventHandler(async (event) => {
  const body: RequestBody = await readBody(event);
  try {
    switch (body.mode) {
      case "email":
        await supabase.from("users").upsert({
          email: body.email,
          dept_code: body.dept_code,
          warning_alerts: body.warning_alerts,
          fire_alerts: body.fire_alerts,
        });
        break;
      case "webhook":
        await supabase.from("webhooks").upsert({
          url: body.url,
          dept_code: body.dept_code,
          warning_alerts: body.warning_alerts,
          fire_alerts: body.fire_alerts,
        });
        break;
    }
  } catch (error) {
    console.error("Error processing subscription:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to process subscription request",
    });
  }
});

import { readBody } from "h3";

interface RequestBody {
  email: string;
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

  await supabase.from("users").upsert(body);
});

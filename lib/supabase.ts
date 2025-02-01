import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/schema";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

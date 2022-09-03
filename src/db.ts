import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.log("supabaseUrl", supabaseUrl);
    console.log("supabaseKey", supabaseKey);
    throw new Error("Missing environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

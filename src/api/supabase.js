import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseKey } from "../config/serverConfig.js";

export const supabase = createClient(supabaseUrl, supabaseKey);
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    // Provide dummy values during build time to prevent prerender crashes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-url-for-build.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build';

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

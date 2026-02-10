// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    // allow common api-key header variants that browsers may send
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-apikey, x-api-key, X-API-KEY',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });

    const jwt = authHeader.replace("Bearer ", "").trim();

    const parseJwt = (token: string) => {
      try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        let payload = parts[1];
        payload = payload.replace(/-/g, '+').replace(/_/g, '/');
        while (payload.length % 4 !== 0) payload += '=';
        const json = atob(payload);
        return JSON.parse(json);
      } catch (e) {
        return null;
      }
    };

    const payload = parseJwt(jwt);
    const debugMode = req.headers.get('x-debug') === 'true';
    if (!payload || !payload.sub) {
      if (debugMode) {
        return new Response(JSON.stringify({ ok: false, reason: 'failed_to_parse_jwt', rawJwtHead: jwt?.slice?.(0,16) ?? null, parsed: payload }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
      }
      return new Response('Invalid JWT', { status: 401, headers: CORS_HEADERS });
    }

    const callerId = payload.sub as string;
    if (debugMode) {
      return new Response(JSON.stringify({ ok: true, parsed: payload }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .single();

    if (profile?.role !== "admin") {
      return new Response("Forbidden", { status: 403, headers: CORS_HEADERS });
    }

    const { userId } = await req.json();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) return new Response(error.message, { status: 400, headers: CORS_HEADERS });

    return new Response("User deleted", { status: 200, headers: CORS_HEADERS });
  } catch {
    return new Response("Server error", { status: 500, headers: CORS_HEADERS });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

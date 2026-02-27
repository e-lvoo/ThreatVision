import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080"
];

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : "";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { userId, email, password, username, role, permissions } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Update auth data if provided
    if (email || password) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          email,
          password,
        }
      );

      if (authError) {
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
        );
      }
    }

    // Update profile
    await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: userId, username, role, permissions },
        { onConflict: "id" }
      );

    return new Response(
      JSON.stringify({ message: "User updated successfully" }),
      { status: 200, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
    );
  }
});
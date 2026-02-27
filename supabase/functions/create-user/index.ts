import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Whitelisted origins for CORS
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"];

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : "";

  // Handle preflight request
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
    const { username, email, password, role, permissions } = await req.json();

    // Validate required fields
    if (!username || !email || !password || !role || !permissions) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
      );
    }

    // Validate role
    const allowedRoles = ["admin", "analyst", "viewer"];
    if (!allowedRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
      );
    }

    // Validate permissions
    const allowedPermissions = [
      "view-alert",
      "manage-user",
      "manage-models",
      "acknowledge-alert",
      "access-settings"
    ];

    const invalidPermissions = permissions.filter(p => !allowedPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return new Response(
        JSON.stringify({ error: "Invalid permissions" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create auth user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm for internal users
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
      );
    }

    const userId = userData.user.id;

    // Insert profile into database
    const { error: profileError } = await supabaseAdmin
  .from("profiles")
  .upsert(
    { id: userId, username, role, permissions },
    { onConflict: "id" }
  );

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
      );
    }

    return new Response(
      JSON.stringify({ message: "User created successfully", userId }),
      { status: 200, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500, headers: { "Access-Control-Allow-Origin": allowedOrigin } }
    );
  }
});
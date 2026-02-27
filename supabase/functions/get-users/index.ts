import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8080",
];

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : "";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ FIXED HERE
    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    const users = usersData?.users ?? [];

    const { data: profiles, error: profilesError } =
      await supabaseAdmin.from("profiles").select("*");

    if (profilesError) {
      throw profilesError;
    }

    const mergedUsers = users.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id);

      return {
        id: user.id,
        username:
          profile?.username ||
          user.email?.split("@")[0] ||
          "Unknown",
        email: user.email,
        role: profile?.role || "viewer",
        status: user.user_metadata?.status || "active",
        lastLogin: user.last_sign_in_at
          ? new Date(user.last_sign_in_at)
          : new Date(user.created_at),
        permissions: profile?.permissions || [],
      };
    });

    return new Response(JSON.stringify(mergedUsers), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("Edge function error:", err);

    return new Response(
      JSON.stringify({
        error: "Server error",
        details: err?.message || err,
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      }
    );
  }
});
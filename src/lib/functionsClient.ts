import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

/**
 * Retrieve access token from active Supabase session
 */
async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error(
      'No valid Supabase session found. Please log in again.'
    );
  }

  return data.session.access_token;
}

/**
 * Call a Supabase Edge Function with JWT authentication.
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  body: any
): Promise<T> {
  const accessToken = await getAccessToken();

  console.log("=== DEBUG JWT TOKEN ===");
  console.log("Function:", functionName);
  console.log("Token length:", accessToken.length);
  console.log("=======================");

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // ✅ Only JWT now
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = responseText || response.statusText;

    try {
      const parsed = JSON.parse(responseText);
      errorMessage =
        parsed.message || parsed.error || parsed.details || responseText;
    } catch {
      // Not JSON, keep raw text
    }

    console.error(`[Edge Function] Error from ${functionName}:`, {
      status: response.status,
      error: errorMessage,
    });

    throw new Error(
      `Edge Function '${functionName}' failed (${response.status}): ${errorMessage}`
    );
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return responseText as unknown as T;
  }
}

/**
 * Create a new user
 */
export const createUserFn = (data: {
  username: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
}) =>
  callEdgeFunction('create-user', data);

/**
 * Update user
 */
export const updateUserFn = (
  userId: string,
  email?: string,
  password?: string,
  role?: string
) =>
  callEdgeFunction('update-user', { userId, email, password, role });

/**
 * Delete user
 */
export const deleteUserFn = (userId: string) =>
  callEdgeFunction('delete-user', { userId });

/**
 * Get all users from auth table
 */
export const getUsersFn = async () => {
  const accessToken = await getAccessToken();
  const url = `${SUPABASE_URL}/functions/v1/get-users`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = responseText || response.statusText;

    try {
      const parsed = JSON.parse(responseText);
      errorMessage = parsed.message || parsed.error || parsed.details || responseText;
    } catch {
      // Not JSON, keep raw text
    }

    throw new Error(
      `Edge Function 'get-users' failed (${response.status}): ${errorMessage}`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

export default { createUserFn, updateUserFn, deleteUserFn, getUsersFn };
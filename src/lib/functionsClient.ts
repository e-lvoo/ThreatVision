import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Retrieve access token with multiple fallback strategies
 */
async function getAccessToken(): Promise<string> {
  // Strategy 1: Get from active Supabase session
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    return data.session.access_token;
  }

  // Strategy 2: Fallback - try to get user and retrieve token from storage
  try {
    const userRes = await supabase.auth.getUser();
    if (userRes.data?.user) {
      // Try to retrieve token from Supabase client storage
      const storageKey = `sb-${SUPABASE_URL}-auth-token`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.access_token) {
            return parsed.access_token;
          }
        } catch {
          // Storage parse failed, continue
        }
      }
    }
  } catch {
    // User retrieval failed, continue
  }

  throw new Error(
    'No valid Supabase session found. Please ensure you are logged in before calling Edge Functions.'
  );
}

/**
 * Call a Supabase Edge Function with automatic JWT authentication.
 * 
 * @template T - The expected response type
 * @param functionName - The name of the Edge Function (e.g., 'create-user')
 * @param body - The request body to send to the function
 * @returns The parsed JSON response from the Edge Function
 * @throws {Error} If user is not authenticated or the function call fails
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  body: any
): Promise<T> {
  let accessToken: string;

  try {
    accessToken = await getAccessToken();
    console.log (`[Edge Function ] Retrieved access token for function '${functionName}'`); 
    console.log (`[Edge Function ] Access token length: ${accessToken}}`);
    // accessToken = import.meta.env.VITE_SUPABASE_JWT || '';
  } catch (err) {
    throw err;
  }

  // Build the Edge Function URL
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  console.debug(`[Edge Function] Calling ${functionName}`, {
    url,
    hasToken: !!accessToken,
  });

  // Make the request with JWT in Authorization header
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  // Handle non-OK responses
  if (!response.ok) {
    let errorMessage = responseText || response.statusText;

    try {
      const parsed = JSON.parse(responseText);
      errorMessage = parsed.message || parsed.error || parsed.details || responseText;
    } catch {
      // responseText is not JSON, use as-is
    }

    console.error(`[Edge Function] Error from ${functionName}:`, {
      status: response.status,
      error: errorMessage,
      headers: Object.fromEntries(response.headers.entries()),
    });

    throw new Error(
      `Edge Function '${functionName}' failed (${response.status}): ${errorMessage}`
    );
  }

  // Parse and return the response
  try {
    return JSON.parse(responseText) as T;
  } catch {
    // Return as plain text if response is not JSON
    return responseText as unknown as T;
  }
}

/**
 * Create a new user via the create-user Edge Function.
 */
export const createUserFn = (email: string, password: string, role: string) =>
  callEdgeFunction('create-user', { email, password, role });

/**
 * Update an existing user via the update-user Edge Function.
 */
export const updateUserFn = (
  userId: string,
  email?: string,
  password?: string,
  role?: string
) =>
  callEdgeFunction('update-user', { userId, email, password, role });

/**
 * Delete a user via the delete-user Edge Function.
 */
export const deleteUserFn = (userId: string) =>
  callEdgeFunction('delete-user', { userId });

export default { createUserFn, updateUserFn, deleteUserFn };

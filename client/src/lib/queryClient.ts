import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Enhanced error handling with detailed error information
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = '';
    try {
      // Try to parse as JSON first
      const errorData = await res.json();
      if (errorData.error && typeof errorData.error === 'object') {
        errorMessage = errorData.error.message || JSON.stringify(errorData);
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else {
        errorMessage = JSON.stringify(errorData);
      }
    } catch (e) {
      // If not JSON, get as text
      try {
        errorMessage = await res.text();
      } catch (textError) {
        errorMessage = res.statusText;
      }
    }
    
    // Create a custom error with status code and message
    const error = new Error(`${res.status}: ${errorMessage}`);
    (error as any).statusCode = res.status;
    (error as any).response = res;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,  // Enable refetching when window is focused for better data consistency
      staleTime: 60 * 1000,  // Consider data stale after 1 minute to balance caching and freshness
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors, but retry on network errors or 5xx errors
        const statusCode = (error as any)?.statusCode;
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          return false;
        }
        return failureCount < 2;  // Retry up to 2 times for other errors
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors, but retry on network errors or 5xx errors
        const statusCode = (error as any)?.statusCode;
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          return false;
        }
        return failureCount < 1;  // Only retry once for mutations
      },
    },
  },
});

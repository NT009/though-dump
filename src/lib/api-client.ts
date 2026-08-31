export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, config);

  let responseData;
  try {
    responseData = await response.json();
  } catch (err) {
    responseData = null;
  }

  if (response.ok) {
    return responseData;
  } else {
    const errorMessage = responseData?.error || response.statusText;
    throw new ApiError(response.status, errorMessage, responseData);
  }
}

import { toast } from "sonner";

/**
 * A global error handler that categorizes API errors and automatically shows the appropriate toast.
 */
export function handleApiError(error: any, customUserMessage?: string) {
  console.error("API Request Failed:", error);
  
  if (error instanceof ApiError || error.status) {
    if (error.status >= 400 && error.status < 500) {
      toast.error(customUserMessage || error.message || "Please check your input and try again.");
    } else {
      toast.error("Issue from our end, please contact support.");
    }
  } else {
    toast.error("Network issue. Please check your internet connection and try again.");
  }
}

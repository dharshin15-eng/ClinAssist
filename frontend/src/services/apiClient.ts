/**
 * Centralized API client foundation for ClinAssist backend communication.
 * Handles base URL configuration, JWT bearer header attachment, and standardized error parsing.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiError {
  status: number;
  message: string;
  error?: string;
  path?: string;
}

export class ApiClientError extends Error {
  status: number;
  error?: string;
  path?: string;

  constructor(status: number, message: string, error?: string, path?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.error = error;
    this.path = path;
  }
}

const getStoredToken = (): string | null => {
  return localStorage.getItem('clinassist_token');
};

const getHeaders = (optionsHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (optionsHeaders) {
    Object.assign(headers, optionsHeaders);
  }

  return headers;
};

const parseErrorResponse = async (response: Response): Promise<ApiClientError> => {
  let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
  let errorType = response.statusText;
  let path = '';

  try {
    const errorData = await response.json();
    if (errorData) {
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.error) {
        errorType = errorData.error;
      }
      if (errorData.path) {
        path = errorData.path;
      }
    }
  } catch (e) {
    // If response body is not JSON, use default HTTP status message
  }

  return new ApiClientError(response.status, errorMessage, errorType, path);
};

export const apiClient = {
  async get<T>(endpoint: string, customHeaders?: HeadersInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(customHeaders)
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return await response.json() as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(0, 'Unable to connect to backend server. Please verify Spring Boot is running on port 8080.');
    }
  },

  async post<T>(endpoint: string, body: any, customHeaders?: HeadersInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(customHeaders),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      // Handle 204 No Content or empty response body
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(0, 'Unable to connect to backend server. Please verify Spring Boot is running on port 8080.');
    }
  },

  async put<T>(endpoint: string, body: any, customHeaders?: HeadersInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(customHeaders),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return await response.json() as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(0, 'Unable to connect to backend server. Please verify Spring Boot is running on port 8080.');
    }
  },

  async patch<T>(endpoint: string, body: any, customHeaders?: HeadersInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(customHeaders),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return await response.json() as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(0, 'Unable to connect to backend server. Please verify Spring Boot is running on port 8080.');
    }
  },

  async delete<T>(endpoint: string, customHeaders?: HeadersInit): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(customHeaders)
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(0, 'Unable to connect to backend server. Please verify Spring Boot is running on port 8080.');
    }
  },

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return await response.json() as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(0, 'Unable to connect to backend server. Please verify Spring Boot is running on port 8080.');
    }
  }
};


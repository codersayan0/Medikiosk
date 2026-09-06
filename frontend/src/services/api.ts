const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";


export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };


  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );


  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }


  if (!response.ok) {

    throw new Error(
      data?.detail ||
      data?.message ||
      `API Error: ${response.status}`
    );
  }


  return data;
}
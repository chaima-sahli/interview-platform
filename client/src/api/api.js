const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


async function request(endpoint, { method = "GET", body, headers = {} } = {}) {
  const storedUser = localStorage.getItem("interviewhub_user");
  const token = storedUser ? JSON.parse(storedUser).token : null;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: "POST", body }),
  put: (endpoint, body) => request(endpoint, { method: "PUT", body }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;
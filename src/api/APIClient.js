const BASE_URL = import.meta.env.VITE_BASE_API_URL;

function getSessionId() {
  let id = sessionStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("sessionId", id);
  }
  return id;
}

function getHeaders() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const headers = {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(),
    "X-Request-Id": crypto.randomUUID(),
    "X-Client-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (user?.id) headers["X-User-Id"] = user.id;
  if (user?.email) headers["X-User-Email"] = user.email;
  return headers;
}

async function request(method, path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    credentials: "include",
    body: body && JSON.stringify(body),
  });

  if (!response.ok) {
    const error = new Error(response.statusText);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

const APIClient = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export default APIClient;

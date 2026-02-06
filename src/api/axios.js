import axios from "axios";

/*
  AUTO-DETECT API URL:

  - If .env has VITE_API_URL → use it
  - Else if accessing from phone (LAN IP) → use same host
  - Else fallback localhost
*/

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const host = window.location.hostname;

  // If opened from phone or LAN
  if (host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:5000/api`;
  }

  // Default laptop
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

/* 🔐 Attach JWT token */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Only logout if token actually invalid
    if (status === 401 && localStorage.getItem("token")) {
      console.warn("Token expired or invalid");
      localStorage.removeItem("token");

      setTimeout(() => {
        window.location.replace("/login");
      }, 300); // small delay prevents flicker
    }

    return Promise.reject(error);
  }
);


/* 🚪 Handle auth errors */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const isAuthRoute =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;

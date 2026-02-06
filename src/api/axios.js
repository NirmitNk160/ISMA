import axios from "axios";

/*
  AUTO-DETECT API URL:

  - Uses VITE_API_URL if set
  - Else uses same host (phone/laptop LAN)
  - Else localhost fallback
*/

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const host = window.location.hostname;

  if (host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:5000/api`;
  }

  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});


/* 🔐 ATTACH TOKEN TO EVERY REQUEST (CRITICAL FIX) */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/* 🚪 HANDLE UNAUTHORIZED RESPONSES */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const isAuthRoute =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
      console.warn("Unauthorized → Logging out");

      localStorage.removeItem("token");

      setTimeout(() => {
        window.location.replace("/login");
      }, 200);
    }

    return Promise.reject(error);
  }
);

export default api;

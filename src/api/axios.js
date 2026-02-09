import axios from "axios";

/*
=========================================
ISMA API CONFIG (FINAL)
=========================================

Priority:

1️⃣ VITE_API_URL from .env (ngrok / production)
2️⃣ Fallback to localhost backend

IMPORTANT:
- Restart frontend after editing .env
- Never hardcode ngrok URL in code
*/

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* =========================================
   🔐 ATTACH JWT TOKEN TO EVERY REQUEST
========================================= */
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

/* =========================================
   🚪 AUTO LOGOUT ON 401
========================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Skip login/register routes
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

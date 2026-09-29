import axios from "axios";

// =====================================
// BACKEND API URL
// Localhost ya Production automatically
// =====================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://soldout-backend.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// =====================================
// REQUEST INTERCEPTOR
// =====================================

axiosInstance.interceptors.request.use(
  (config) => {
    const currentPath = window.location.pathname;

    // Admin pages ke liye admin token
    const isAdminPath = currentPath.startsWith("/admin");

    const token = isAdminPath
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================
// RESPONSE INTERCEPTOR
// =====================================

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const requestUrl = error.config?.url || "";
    const currentPath = window.location.pathname;

    // Auth requests ko global logout handler se bahar rakho
    const isAuthEntryPoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/admin/login") ||
     
      requestUrl.includes("/auth/verify-email") ||
      requestUrl.includes("/auth/resend-otp") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    if (isAuthEntryPoint) {
      return Promise.reject(error);
    }

    // =====================================
    // INVALID / EXPIRED TOKEN
    // =====================================

    if (
      error.response &&
      (
        error.response.status === 401 ||
        error.response.status === 403 ||
        error.response.data?.message
          ?.toLowerCase()
          .includes("expired")
      )
    ) {
      console.log("Session expired or invalid token.");

      // =====================================
      // ADMIN SESSION
      // =====================================

      if (currentPath.startsWith("/admin")) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUsername");

        window.location.href = "/admin/login";

        return Promise.reject(error);
      }

      // =====================================
      // CUSTOMER SESSION
      // =====================================

      localStorage.removeItem("token");
      localStorage.removeItem("username");

      const protectedPaths = [
        "/cart",
        "/my-orders",
        "/profile",
        "/checkout",
        "/wishlist",
      ];

      const isProtectedPath = protectedPaths.some(
        (path) =>
          currentPath === path ||
          currentPath.startsWith(`${path}/`)
      );

      if (isProtectedPath) {
        window.location.href = "/login";
      } else {
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
import axios from "axios";
import { API_ENDPOINTS } from "../config/api.config";

const AuthService = {
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await axios.post(
        `${API_ENDPOINTS.AUTH}/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Store admin status
      localStorage.setItem("isAdmin", String(response.data.is_admin));
      localStorage.setItem("isAuthenticated", "true");
    } catch (error) {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("isAuthenticated");
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_ENDPOINTS.AUTH}/auth/logout`, {}, { withCredentials: true });
    } finally {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("isAuthenticated");
    }
  },

  isAdmin(): boolean {
    return localStorage.getItem("isAdmin") === "true" && this.isAuthenticated();
  },

  isAuthenticated(): boolean {
    return localStorage.getItem("isAuthenticated") === "true";
  },
};

export default AuthService;

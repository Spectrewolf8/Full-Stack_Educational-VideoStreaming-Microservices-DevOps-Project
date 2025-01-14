import axios from "axios";
import { API_ENDPOINTS } from "../config/api.config";
import { Video } from "../types/types";

axios.defaults.withCredentials = true;

// API functions
export const setupAxiosInterceptors = () => {
  axios.defaults.withCredentials = true;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (!error.config.url?.includes("/watchlist")) {
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("isAuthenticated");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );
};

// Keep existing API functions, but make sure they use withCredentials
export const getVideos = async () => {
  const response = await axios.get(`${API_ENDPOINTS.VIDEO}/videos`, { withCredentials: true });
  return response.data;
};

export const getWatchlist = async () => {
  const response = await axios.get(`${API_ENDPOINTS.WATCHLIST}/watchlist`, { withCredentials: true });
  return response.data;
};

export const addToWatchlist = async (video: Video) => {
  try {
    await axios.post(`${API_ENDPOINTS.WATCHLIST}/watchlist/add`, video, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return false;
  }
};

export const removeFromWatchlist = async (videoId: string) => {
  try {
    await axios.delete(`${API_ENDPOINTS.WATCHLIST}/watchlist/remove/${videoId}`, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }
};
export const uploadVideo = async (formData: FormData) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.VIDEO}/videos/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Upload error details:", error.response?.data);
      if (error.response?.status === 403) {
        throw new Error("Admin access required");
      } else if (error.response?.status === 401) {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("isAuthenticated");
        window.location.href = "/login";
      }
    }
    throw error;
  }
};

export const getVideoUrl = async (videoId: string) => {
  const response = await axios.get(`${API_ENDPOINTS.VIDEO}/videos/${videoId}/url`, { withCredentials: true });
  return response.data.url;
};

export const updateVideoMetadata = async (
  videoId: string,
  metadata: {
    title: string;
    description: string;
    thumbnailUrl: string;
    duration?: string;
  },
) => {
  return axios.put(`${API_ENDPOINTS.VIDEO}/videos/${videoId}/metadata`, metadata, { withCredentials: true });
};
// export const setupAxiosInterceptors = () => {
//   axios.defaults.withCredentials = true; // Enable cookies

//   axios.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       if (error.response?.status === 401) {
//         // Clear local storage
//         localStorage.removeItem("isAdmin");
//         window.location.href = "/login";
//       }
//       return Promise.reject(error);
//     },
//   );
// };

import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getVideos, addToWatchlist, removeFromWatchlist, getWatchlist } from "../../services/api";
import { Video } from "../../types/types";
import VideoCard from "./VideoCard";
import "./Videolist.style.css";
import axios from "axios";

const Videolist: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoList, watchlist] = await Promise.all([getVideos(), getWatchlist()]);
        setVideos(videoList);
        setWatchlistIds(watchlist.map((video: Video) => video.id));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          history.push("/login");
        }
      }
    };
    fetchData();
  }, [history]);

  const handleWatchlistToggle = async (video: Video) => {
    try {
      let success;
      if (watchlistIds.includes(video.id)) {
        success = await removeFromWatchlist(video.id);
        if (success) {
          setWatchlistIds(watchlistIds.filter((id) => id !== video.id));
        }
      } else {
        success = await addToWatchlist(video);
        if (success) {
          setWatchlistIds([...watchlistIds, video.id]);
        }
      }

      if (!success) {
        console.error("Failed to update watchlist");
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
    }
  };

  return (
    <div className="video-container">
      <h1 className="page-title">Available Videos</h1>
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onAddToWatchlist={handleWatchlistToggle}
            isInWatchlist={watchlistIds.includes(video.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Videolist;

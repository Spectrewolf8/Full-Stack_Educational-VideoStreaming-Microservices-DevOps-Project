import React, { useState } from "react";
import VideoMetadataEditor from "./VideoMetadataEditor";
import VideoUploader from "./VideoUploader";
import "./AdminPanel.style.css";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "metadata">("upload");

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button className={`tab ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>
          Upload Video
        </button>
        <button className={`tab ${activeTab === "metadata" ? "active" : ""}`} onClick={() => setActiveTab("metadata")}>
          Edit Metadata
        </button>
      </div>

      <div className="admin-content">{activeTab === "upload" ? <VideoUploader /> : <VideoMetadataEditor />}</div>
    </div>
  );
};

export default AdminPanel;

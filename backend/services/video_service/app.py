from datetime import datetime, timedelta
from bson import ObjectId
from flask import Flask, json, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required, JWTManager
import boto3
import os
from dotenv import load_dotenv
from botocore.config import Config
from pymongo import MongoClient

# Load environment variables first
load_dotenv()

# Verify JWT secret key exists
jwt_secret = os.getenv("JWT_SECRET_KEY")
if not jwt_secret:
    raise RuntimeError("JWT_SECRET_KEY environment variable is not set")

app = Flask(__name__)


# MongoDB Connection Setup
client = MongoClient(os.getenv("MONGODB_URI"))
db = client.EDUCATIONAL_VIDEO_STREAMING_DB


# AWS Configuration with Session Token
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_REGION"),
    config=Config(signature_version="s3v4"),
)

# AWS Configuration with Session Token
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_REGION"),
    config=Config(signature_version="s3v4"),
)

BUCKET_NAME = os.getenv("S3_BUCKET")

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # Disable CSRF for simplicity
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_COOKIE_SAMESITE"] = "Lax"

# Update CORS configuration
CORS(app, supports_credentials=True, origins="*")

jwt = JWTManager(app)


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Invalid token", "message": str(error)}), 422


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired", "message": "The token has expired"}), 401


@app.route("/videos", methods=["GET"])
@jwt_required()
def list_videos():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        videos = []

        if "Contents" in response:
            for item in response["Contents"]:
                if item["Key"].endswith((".mp4", ".webm")):
                    video_id = item["Key"].split("/")[-1].rsplit(".", 1)[0]
                    video_metadata = db.videos.find_one({"id": video_id}) or {}

                    videos.append(
                        {
                            "id": video_id,
                            "title": video_metadata.get("title", video_id),
                            "description": video_metadata.get("description", ""),
                            "thumbnailUrl": video_metadata.get("thumbnail_url", ""),
                            "uploadDate": video_metadata.get(
                                "upload_date", item["LastModified"].isoformat()
                            ),
                            "duration": video_metadata.get("duration", ""),
                        }
                    )

        return jsonify(videos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/videos/<video_id>/metadata", methods=["PUT"])
@jwt_required()
def update_video_metadata(video_id):
    try:
        data = request.get_json()

        metadata = {
            "id": video_id,
            "title": data.get("title"),
            "description": data.get("description"),
            "thumbnail_url": data.get("thumbnailUrl"),
            "duration": data.get("duration"),
            "upload_date": data.get("uploadDate"),
        }

        db.videos.update_one({"id": video_id}, {"$set": metadata}, upsert=True)

        return jsonify({"message": "Metadata updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/videos/<video_id>/url", methods=["GET"])
@jwt_required()
def get_video_url(video_id):
    try:
        # First, list all objects to find matching video
        print(f"Looking for video with ID: {video_id}")
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)

        if "Contents" in response:

            # Try to find matching video file
            for item in response["Contents"]:
                key = item["Key"]
                # Check if this key matches our video_id
                file_name = key.split("/")[-1] if "/" in key else key
                base_name = file_name.rsplit(".", 1)[0]

                if base_name == video_id:
                    print(f"Found matching video: {key}")
                    url = s3.generate_presigned_url(
                        "get_object",
                        Params={"Bucket": BUCKET_NAME, "Key": key, "ResponseContentType": "video/mp4"},
                        ExpiresIn=900,
                    )
                    # print(url)
                    return jsonify({"url": url})

        print("No matching video found")
        return jsonify({"error": "Video not found"}), 404

    except Exception as e:
        print(f"Error generating video URL: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/videos/upload", methods=["POST"])
@jwt_required()
def upload_video():
    try:
        # Get user identity
        current_user_id = get_jwt_identity()
        print(f"Current user identity: {current_user_id}")  # Debug log

        # Get user info from MongoDB to check admin status
        try:
            user = db.users.find_one({"_id": ObjectId(current_user_id)})
            print(f"Found user: {user}")  # Debug log
        except Exception as e:
            print(f"Error finding user: {e}")  # Debug log
            return jsonify({"error": "Invalid user ID"}), 400
        print(user)
        if not user or not user.get("is_admin"):
            return jsonify({"error": "Admin access required"}), 403

        if "video" not in request.files:
            return jsonify({"error": "No video file"}), 400

        file = request.files["video"]
        metadata = json.loads(request.form.get("metadata", "{}"))

        # Upload to S3
        file_name = f"{file.filename}"
        s3.upload_fileobj(file, BUCKET_NAME, file_name)

        # Store metadata in MongoDB
        video_id = file.filename.rsplit(".", 1)[0]
        metadata_to_store = {
            "id": video_id,
            "title": metadata.get("title", ""),
            "description": metadata.get("description", ""),
            "thumbnail_url": metadata.get("thumbnailUrl", ""),
            "upload_date": datetime.utcnow().isoformat(),
        }

        db.videos.update_one({"id": video_id}, {"$set": metadata_to_store}, upsert=True)

        return jsonify({"message": "Upload successful"}), 201

    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# 5001 is the default port for video service
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

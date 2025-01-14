Collecting workspace information

# Educational Video Streaming System

## Overview

This project is an educational video streaming system that allows users to authenticate, stream videos, and manage their watchlists. It utilizes React for the frontend, Flask microservices for the backend, and MongoDB for data storage, with cloud services provided by Amazon S3 and EC2.

## Features

- User authentication (login and registration)
- Video streaming capabilities
- Watchlist management for users
- Admin panel for video upload and metadata management
- Responsive design for various devices

## Technologies Used

- **Frontend:** React, TypeScript
- **Backend:** Flask, Python
- **Database:** MongoDB
- **Cloud Services:** Amazon S3, Amazon EC2
- **Containerization:** Docker
- **CI/CD:** GitLab CI/CD
- **Load Balancing:** HAProxy

## Project Structure

- **frontend/**: Contains the React application.
- **backend/**: Contains Flask microservices for authentication, video streaming, and watchlist management.
  - **auth_service/**: Handles user authentication.
  - **video_service/**: Manages video streaming and metadata.
  - **watchlist_service/**: Manages user watchlists.
- **infrastructure/**: Contains setup scripts for AWS services and CI/CD configurations.
- **docker-compose.yml**: Docker Compose configuration for local development.
- **remote.docker-compose.yml**: Docker Compose configuration for remote deployment.
- **haproxy.cfg**: HAProxy configuration for load balancing.

## Architecture

The system follows a microservices architecture, with each service encapsulated in its own Docker container. The services communicate with each other over HTTP and are load-balanced using HAProxy. The architecture is designed to be scalable and resilient, leveraging AWS services for storage and deployment.

### Frontend

The frontend is built with React and TypeScript, providing a responsive user interface for video streaming, authentication, and watchlist management. It communicates with the backend services via RESTful APIs.

### Backend

The backend consists of three Flask microservices:

1. **Auth Service**: Manages user authentication, including login, registration, and token management.
2. **Video Service**: Handles video streaming, metadata management, and video uploads to Amazon S3.
3. **Watchlist Service**: Manages user watchlists, allowing users to add and remove videos from their watchlists.

### Database

MongoDB is used as the primary database for storing user information, video metadata, and watchlist data. Each microservice connects to the MongoDB instance to perform CRUD operations.

### Cloud Services

- **Amazon S3**: Used for storing video files and serving them to users.
- **Amazon EC2**: Hosts the Docker containers for the microservices and frontend application.

### CI/CD

GitLab CI/CD is used for continuous integration and deployment. The `.gitlab-ci.yml` file defines the CI/CD pipeline, which includes stages for testing, building, deploying, and monitoring the application.

### Load Balancing & Reverse Proxy

HAProxy serves as both a load balancer and reverse proxy in this architecture:

- **Load Balancing**: Distributes incoming HTTP requests across multiple instances of microservices to ensure optimal resource utilization and high availability.

- **Reverse Proxy**:
  - Routes requests to appropriate backend services based on URL paths (`/auth-backend`, `/videos-backend`, `/watchlist-backend`)
  - Handles URL path rewriting to maintain clean API endpoints
  - Manages CORS headers and preflight requests
  - Provides a single entry point (port 80) for all frontend and backend services
  - Hides internal service architecture from external clients
  - Adds an additional security layer by not exposing backend services directly

The routing configuration can be found in [haproxy.cfg](haproxy.cfg), which defines frontend and backend rules for request handling and service routing.

## Setup Instructions

1. Clone the repository.
2. Navigate to the `frontend` directory and run `npm install` to install dependencies.
3. Navigate to the `backend` directory and set up a virtual environment, then install dependencies from `requirements.txt`.
4. Configure AWS credentials for S3 and EC2. 5. Run the backend services using Docker with `docker-compose up`. 6. Start the frontend application with `npm start`.

## Deployment

To deploy the application to a remote server, follow these steps:

1. Ensure the remote server has Docker and Docker Compose installed.
2. Copy the`remote.docker-compose.yml` file to the remote server. 3. Configure the environment variables in the `.env` file. 4. Run the following commands on the remote server:

```sh
docker-compose -f remote.docker-compose.yml up -d
```

## Monitoring

The `setup_monitoring.py` script sets up a CloudWatch dashboard for monitoring the application's health and performance. It includes widgets for service health, application health, network health, API performance, security metrics, service availability, S3 storage metrics, custom application metrics, and estimated AWS charges.

## License

This project is licensed under the MIT License.

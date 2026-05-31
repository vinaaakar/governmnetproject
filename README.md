# Unified Complaint Routing System (UCRS)

An intelligent, AI-powered government grievance redressal platform that automatically routes citizen complaints to the correct government department and regional office using AI, NLP, voice recognition, and geolocation.

## Project Structure

- `frontend/`: React + Vite frontend application with Tailwind CSS & Framer Motion.
- `backend/`: Node.js + Express API backend with MongoDB integration.
- `ai-service/`: Python FastAPI microservice for AI-based NLP classification and duplicate detection.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth.
- **AI Service**: Python, FastAPI, HuggingFace Transformers (Dummy logic integrated for initial fast prototype).
- **Deployment**: Docker & Docker Compose.

## How to Run locally using Docker

Ensure you have Docker and Docker Compose installed.

1. Navigate to the project root directory.
2. Run the following command to build and start all microservices:

   ```bash
   docker-compose up --build
   ```

3. Access the applications:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000/api/health
   - **AI Service**: http://localhost:8000/health

## Features Included in Prototype

1. **Citizen Authentication**: Register and Login using JWT.
2. **AI Complaint Routing**: Complaint text is analyzed to predict the correct government department and severity level.
3. **Voice Input**: Citizens can use browser-based speech recognition to record complaints.
4. **Geolocation**: Automatically captures GPS coordinates when submitting complaints.
5. **Duplicate Detection**: AI service checks for similar past complaints before saving a new one.
6. **Citizen Dashboard**: Premium dark/light mode compatible UI to track complaint status.

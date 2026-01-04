# Personality Quiz Application

This is a simple personality quiz application built with React for the frontend and Node.js (Express) for the backend, all containerized using Docker and orchestrated with Docker Compose.

## Features

*   **Interactive Quiz:** Users can answer a series of personality questions.
*   **Backend Analysis:** Quiz results are sent to a backend service for analysis.
*   **Dominant Trait Identification:** The backend identifies and returns the user's most dominant personality trait.
*   **Containerized Environment:** Both frontend and backend run in separate Docker containers.
*   **Subtle UI:** A clean and modern user interface with a subtle animated gradient background.

## Setup and Running the Application

To get this application up and running on your local machine, follow these steps:

### Prerequisites

Make sure you have the following installed:

*   [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd wdm
    ```

2.  **Build and run the Docker containers:**

    Navigate to the root directory of the project (where `docker-compose.yml` is located) and run the following command:

    ```bash
    docker-compose up --build
    ```

    This command will:
    *   Build the Docker images for both the frontend and backend services.
    *   Start both containers.
    *   The frontend will be accessible via your web browser.

### Accessing the Application

Once the containers are up and running, you can access the frontend application by opening your web browser and navigating to:

```
http://localhost:5173
```

## Project Structure

```
. \
├── backend/                  # Node.js Express backend service
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── quizData.json         # Duplicated quiz data for backend analysis
├── public/                   # Static assets for the frontend
├── src/                      # React frontend source code
│   ├── components/
│   │   ├── quizChoices.jsx
│   │   ├── quizResult.jsx
│   ├── pages/
│   │   ├── home.jsx
│   │   └── quiz.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── quizData.json         # Main quiz data for frontend rendering
├── Dockerfile                # Dockerfile for the React frontend
├── docker-compose.yml        # Defines and links the frontend and backend services
├── eslint.config.js
├── index.html
├── LICENSE                   # MIT License file
├── nginx.conf                # Nginx configuration for the frontend proxy
├── package-lock.json
├── package.json
├── README.md                 # This file
└── vite.config.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
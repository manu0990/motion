# Worker Service

This service handles receiving Manim code snippets, rendering them into video animations, and uploading the final result to an AWS S3 bucket. It is designed to run within a Docker container that has Manim and its dependencies pre-installed.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-404d59?logo=express&logoColor=%2361DAFB" alt="Express.js" />
  <img src="https://img.shields.io/badge/Manim-0.19.0-blue" alt="Manim 0.19.0" />
  <img src="https://img.shields.io/badge/AWS%20SDK-v3-232F3E?logo=amazonaws&logoColor=white" alt="AWS SDK v3" />
  <img src="https://img.shields.io/badge/pnpm-000000?logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>


---

## 🚀 Quick Start

### Prerequisites

- Node.js & pnpm
- Docker
- Access to an AWS S3 bucket with credentials

### Local Development

1.  **Navigate to the worker directory**
    From the monorepo root:

    ```bash
    cd worker
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Configure environment**
    Create a `.env` file in the `worker/` directory and populate it with your credentials.

    ```env
    # Worker server port (optional; default: 3001)
    PORT=3001

    # AWS S3 Configuration for video uploads
    S3_BUCKET_NAME=your-s3-bucket-name
    AWS_REGION=your-aws-region
    AWS_ACCESS_KEY_ID=your_access_key_id
    AWS_SECRET_ACCESS_KEY=your_secret_access_key

    # Optional: For S3-compatible services like MinIO
    # S3_ENDPOINT=http://localhost:9000
    ```

4.  **Run the development server**
    This requires having `manim` and its dependencies (like `ffmpeg`, `cairo`) installed on your local machine.

    ```bash
    pnpm dev
    ```

5.  **Health check**
    ```bash
    curl http://localhost:3001/health
    # → { "message": "Health is OK" }
    ```

### Running with Docker

This is the recommended way to run the service as it isolates the Manim environment.

1.  **Build the Docker image**
    From the `worker/` directory:

    ```bash
    docker build -t manim-worker .
    ```

2.  **Run the container**
    ```bash
    docker run --rm -p 3001:3001 --env-file .env manim-worker
    ```

---

## 📁 Directory Structure

```text
worker/
├── src/
│   ├── index.ts          # Entry point, starts the Express server
│   ├── server.ts         # Express app, routes, and main logic
│   └── services/
│       ├── manimService.ts   # Logic for executing Manim CLI
│       └── uploadService.ts  # Logic for uploading files to S3
├── jobs/                 # .gitignore'd dir for temporary render files
├── Dockerfile            # Multi-stage Dockerfile for the service
├── package.json
└── tsconfig.json
```

---

## 🔧 Configuration Variables

| Variable                | Description                                                          | Required |
| ----------------------- | -------------------------------------------------------------------- | :------: |
| `PORT`                  | Port for the Express server to listen on. Defaults to `3001`.        |    No    |
| `S3_BUCKET_NAME`        | The name of the AWS S3 bucket to upload videos to.                   |   Yes    |
| `AWS_REGION`            | The AWS region where the S3 bucket is located.                       |   Yes    |
| `AWS_ACCESS_KEY_ID`     | Your AWS access key ID.                                              |   Yes    |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret access key.                                          |   Yes    |
| `S3_ENDPOINT`           | The endpoint URL for an S3-compatible storage service (e.g., MinIO). |    No    |

---

## ⚙️ HTTP Endpoints

### `POST /api/render`

Receives a Manim scene script, renders it into a video, and uploads the result to S3.

- **Request Body**:

  ```json
  {
    "codeContent": "from manim import *\n\nclass MyScene(Scene):\n    def construct(self):\n        self.play(Create(Circle()))",
    "quality": "-ql"
  }
  ```

  - `codeContent` (string, required): The Python code for the Manim scene.
  - `quality` (string, optional): The quality flag for the Manim render. Defaults to `-qm`.
    - Allowed values: `'-ql'`, `'-qm'`, `'-qh'`, `'-qp'`, `'-qk'`.

- **Successful Response (200)**:

  ```json
  {
    "message": "Video created and uploaded successfully.",
    "s3Key": "videos/uuid-goes-here/MyScene.mp4"
  }
  ```

- **Error Response (4xx/5xx)**:
  ```json
  {
    "message": "Error message describing the failure.",
    "errors": {
      /* Optional: Zod validation errors if the request is malformed */
    }
  }
  ```

### `GET /health`

A simple health check endpoint.

- **Response (200)**:
  ```json
  { "message": "Health is OK" }
  ```

---

## 🛠️ Core Services

### `manimService.ts`

- Creates a unique temporary directory under `jobs/` for each render request.
- Writes the user-provided `codeContent` to a `scene.py` file within this directory.
- Detects the scene class name from the code using a regular expression.
- Executes the `manim render` command directly using Node's `child_process.exec`.
- Locates the generated `.mp4` file in the output media directory.
- Returns the path to the video file and the temporary directory for cleanup.
- Throws an error if the Manim process fails or the output video is not found.

### `uploadService.ts`

- Configures the AWS S3 client using environment variables.
- Generates a unique S3 object key for the upload, structured as `videos/<uuid>/<scene_name>.mp4`.
- Streams the video file from the local filesystem to the configured S3 bucket.
- Returns the `s3Key` upon a successful upload.
- Throws an error on any S3 operation failure.

---

## 🔄 Integration Example

To trigger a render from another service (e.g., a Next.js backend), make a POST request to the worker's `/api/render` endpoint.

```ts
// Example using fetch in another Node.js service
async function generateVideo(manimCode: string) {
  try {
    const response = await fetch(`${process.env.WORKER_URL}/api/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codeContent: manimCode,
        quality: "-qm", // medium quality
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to render video.");
    }

    const { s3Key } = await response.json();
    console.log(`Video uploaded successfully. S3 Key: ${s3Key}`);

    // You can now store this s3Key in your database.
    return s3Key;
  } catch (error) {
    console.error("Error calling worker service:", error);
  }
}
```

---

## 💡 Future Ideas

- **Job Queue**: Implement a robust queueing system (e.g., BullMQ, RabbitMQ) to manage concurrent render requests and prevent overloading the server.
- **Status Polling**: Add a `/api/render/status/:jobId` endpoint to allow clients to check the progress of a render job.
- **Authentication**: Secure the worker endpoints with API key authentication or another mechanism to prevent unauthorized use.
- **Result Caching**: Implement a caching layer (e.g., Redis) to return previously rendered videos for identical code and quality inputs, saving computational resources.

# Worker Service README

This document lives in the `worker/` subdirectory of the **Motion** monorepo. It describes how to set up and run the **Worker Service**, which handles receiving Manim code snippets, rendering animations inside Docker, and uploading the resulting video to Cloudinary.

---

## 🚀 Quick Start

1. **Clone the Motion repo**

   ```bash
   cd worker
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment**
   Copy the example `.env` from the root of the monorepo, or create a new one in `worker/`:

   ```env
   # Worker server port (optional; default: 3001)
   PORT=3001

   # Docker image tag containing Manim
   DOCKER_IMAGE=manimcommunity/manim:0.19.0

   # Cloudinary credentials for video upload
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Health check**

   ```bash
   curl http://localhost:3001/health
   # → { "message": "Health is OK" }
   ```

---

## 📁 Directory Structure

```text
worker/                   # Worker microservice
├── src/
│   ├── server.ts             # Express app setup
│   ├── routes/               # Server routes
│   └── helpers/              # Helper functions for worker
├── media/                    # Per-job temporary directories
├── package.json
├── tsconfig.json
└── .env                     # Worker-specific env vars
```

---

## 🔧 Configuration Variables

| Variable                | Description                        |
| ----------------------- | ---------------------------------- |
| `PORT`                  | HTTP server port (default: `3001`) |
| `DOCKER_IMAGE`          | Manim Docker image tag to use      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name              |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                 |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret              |

> **Tip:** You can keep a single `.env` at the repository root if you prefer, as long as the worker process can read the variables.

---

## ⚙️ HTTP Endpoints

### POST `/generate`

* **Purpose**: Receive a Manim scene script, render it, and upload the video.
* **Request Body**:

  ```json
  {
    "codeContent": "<Python code for Manim scene>",
    "quality": "-ql" | "-qm" | "-qh" // optional, defaults to `-qm`
  }
  ```
* **Successful Response (200)**:

  ```json
  {
    "message": "Video created successfully.",
    "jobId": "<uuid>",
    "videoUrl": "https://res.cloudinary.com/.../video.mp4"
  }
  ```
* **Error Response (4xx/5xx)**:

  ```json
  {
    "message": "Error message.",
    "errors": { /* Zod validation errors */ }
  }
  ```

### GET `/health`

* **Purpose**: Simple health-check ping.
* **Response**:

  ```json
  { "message": "Health is OK" }
  ```

---

## 🛠️ Core Modules

### 1. `job-create` Router (`src/routes/job-create.ts`)

* Validates incoming payloads with [Zod](https://github.com/colinhacks/zod).
* Creates a unique workspace under `worker/media/<jobId>/`.
* Writes the script file to `snippets/scene.py`.
* Calls `executeManim()` to run the Dockerized Manim render.
* Calls `uploadToBucket()` to push the final `.mp4` to Cloudinary.
* On failure, logs errors and cleans up the workspace.

### 2. `executeManim()` Helper (`src/helpers/generateVideo.ts`)

* Builds and runs a Docker command:

  ```bash
  docker run --rm \
    -v "<jobDir>:/manim" \
    -w /manim \
    $DOCKER_IMAGE \
    manim render snippets/scene.py <quality>
  ```
* Scans `media/` output for the generated `.mp4` file.
* Throws if rendering fails or no video is found.

### 3. `uploadToBucket()` Helper (`src/helpers/upload-to-bucket.ts`)

* Configures [Cloudinary](https://cloudinary.com) via environment variables.
* Validates local file existence.
* Uploads via `cloudinary.uploader.upload`, returning the secure URL.
* Throws on failure.

---

## 🔄 Integration with Main App

In the Next.js frontend (e.g. `/src/actions/ai/approveAndGenerateVideo.ts`), use Axios to trigger the worker:

```ts
const response = await axios.post(
  `${process.env.WORKER_URL}/generate`,
  { codeContent, quality: '-qm' },
  { headers: { 'Content-Type': 'application/json' } }
);
const { videoUrl } = response.data;
// Save `videoUrl` to your database and update the UI.
```

---

## 🛠️ Future Ideas

* **Job status polling**: Add a `/status/:jobId` endpoint.
* **Authentication & Rate Limiting**: Secure the worker.
* **Caching**: Reuse previously rendered videos for identical inputs.
* **Queue Management**: The b=jobs need to follow a queue to complete.

---

## 📜 License

MIT License © Your Name

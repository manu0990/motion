# Motion

**Motion** is a web application that lets you **generate stunning animations just by describing them in natural language**. Powered by [Manim](https://docs.manim.community/) under the hood, Motion translates your prompt into Python animation code, renders it using a backend worker, and delivers a playable video — all in one seamless flow.

Built with **Next.js**, **Express**, and **OpenAI**, Motion is your creative canvas for math, science, and educational visualizations — no coding required.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/Manim-0.19.0-blue" alt="Manim 0.19.0" />
  <img src="https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB" alt="Express.js" />
  <img src="https://img.shields.io/badge/Google%20Gemini-886FBF?logo=googlegemini&logoColor=fff" alt="Gemini API" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white" alt="Postgres" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript" />
</p>

---

## ✨ Features

* 🧠 **Prompt-to-Animation**: Describe your animation and get a rendered video
* 🎬 **Manim Integration**: Uses Manim to create mathematically accurate visuals
* ⚡ **Express Worker**: A Python-based worker renders Manim code securely
* 🔐 **Google OAuth**: Authenticate via your Google account
* 🌐 **Next.js Frontend**: Smooth UI built with React and deployed via Next.js

---

## 📁 Project Structure

```text
Motion/
├── prisma/                    # Prisma schema & migrations
├── public/                    # Static assets (images, icons, fonts, etc.)
├── src/                       # Next.js application code
│   ├── actions/               # Server-action handlers (e.g. approveAndGenerateVideo)
│   ├── app/                   # Next.js App Router routes & layouts
│   ├── components/            # Reusable UI components
│   ├── context/               # React Contexts & Providers
│   ├── db/                    # Database client initialization
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions & helpers
│   ├── types/                 # Shared TypeScript types
│   └── middleware.ts          # Edge/middleware logic
├── worker/                    # Worker microservice for Manim renders
├── .env                      # Environment variables for main app
└── README.md              # You're reading it :)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root with the following:

```env
DATABASE_URL="postgresql_db_connection_string"

# Google OAuth credentials 
GOOGLE_CLIENT_ID="your google client id"
GOOGLE_CLIENT_SECRET="your google client secret"

# Github OAuth credentials
GITHUB_ID="your github id"
GITHUB_SECRET="your github secret"

NEXTAUTH_SECRET="mynextappsecret"
NEXTAUTH_URL="http://localhost:3000"

# llm model related credentials 
GENERATIVE_LLM_MODEL=""
GEMINI_API_KEY=""

# url of your worker
WORKER_URL="http://localhost:3001"

```

---

## 🧱 Tech Stack

* **Frontend**: Next.js 14, React, Tailwind CSS, NextAuth.js, Prisma
* **Backend Worker**: Express, Manim (Python)
* **Authentication**: Google OAuth
* **AI Integration**: OpenAI (GPT for prompt → code generation)
* **Package Manager**: `pnpm`

---

## 🚀 Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/manu-0990/motion.git
cd motion
pnpm install
```

### 2. Set up the environment

Create a `.env` file at the root using the example above.

### 3. Run the Manim worker

Follow the instruction provided in the folder

### 4. Run the frontend

```bash
pnpm dev
```

---

## 🧪 Example Prompt

> "Make a video of sine wave in a 2d plane"

---

## 🛠️ Future Ideas

* Add a code editor
* User gallery and saved animations
* More animation styles and themes
* Real-time preview and scrubber


---

## 🧑‍💻 Contributing

Pull requests are welcome! Please open an issue first to discuss what you’d like to change.
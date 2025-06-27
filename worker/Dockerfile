### Stage 1: Builder
FROM node:20-bookworm AS builder

WORKDIR /usr/src/app

# Install Python, ffmpeg, and Manim deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv python3-dev python3-pkgconfig \
    ffmpeg pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev \
    build-essential meson ninja-build \
 && rm -rf /var/lib/apt/lists/*

# Setup Python venv and Manim
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip && pip install manim==0.19.0

# Node setup
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build


### Stage 2: Production
FROM node:20-bookworm

WORKDIR /usr/src/app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
      ffmpeg pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Manim venv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Setup Node runtime
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy build output
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3001
CMD ["pnpm", "start"]

### Stage 1: Builder
FROM manimcommunity/manim:v0.19.0 AS builder

WORKDIR /usr/src/app

# Switch to root to install Node.js
USER root

# Install Node.js 22 and pnpm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source code and build
COPY . .
RUN pnpm build


### Stage 2: Production
FROM manimcommunity/manim:v0.19.0

WORKDIR /usr/src/app

# Switch to root to install Node.js
USER root

# Install Node.js 22 and pnpm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy build output from builder stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3001
CMD ["pnpm", "start"]

### Stage 1: Builder
FROM node:20-bookworm AS builder

WORKDIR /usr/src/app

# Install Python, ffmpeg, and complete Manim deps (matching official manimcommunity/manim image)
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv python3-dev python3-pkgconfig \
    build-essential gcc cmake meson ninja-build make \
    libcairo2-dev libffi-dev libpango1.0-dev libjpeg-dev \
    freeglut3-dev ffmpeg pkg-config wget ghostscript fonts-noto \
 && rm -rf /var/lib/apt/lists/*

# Update font cache
RUN fc-cache -fv

# Setup minimal TeX Live installation (matching official manimcommunity/manim image)
ENV PATH=/usr/local/texlive/bin/armhf-linux:/usr/local/texlive/bin/aarch64-linux:/usr/local/texlive/bin/x86_64-linux:$PATH
RUN wget -O /tmp/install-tl-unx.tar.gz http://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz && \
    mkdir /tmp/install-tl && \
    tar -xzf /tmp/install-tl-unx.tar.gz -C /tmp/install-tl --strip-components=1

# Create TeX Live profile for minimal installation
RUN echo "selected_scheme scheme-minimal" > /tmp/texlive-profile.txt && \
    echo "TEXDIR /usr/local/texlive" >> /tmp/texlive-profile.txt && \
    echo "TEXMFCONFIG ~/.texlive/texmf-config" >> /tmp/texlive-profile.txt && \
    echo "TEXMFHOME ~/texmf" >> /tmp/texlive-profile.txt && \
    echo "TEXMFLOCAL /usr/local/texlive/texmf-local" >> /tmp/texlive-profile.txt && \
    echo "TEXMFSYSCONFIG /usr/local/texlive/texmf-config" >> /tmp/texlive-profile.txt && \
    echo "TEXMFSYSVAR /usr/local/texlive/texmf-var" >> /tmp/texlive-profile.txt && \
    echo "TEXMFVAR ~/.texlive/texmf-var" >> /tmp/texlive-profile.txt && \
    echo "option_doc 0" >> /tmp/texlive-profile.txt && \
    echo "option_src 0" >> /tmp/texlive-profile.txt

# Install TeX Live and essential packages
RUN /tmp/install-tl/install-tl --profile=/tmp/texlive-profile.txt && \
    tlmgr install \
    amsmath babel-english cbfonts-fd cm-super count1to ctex doublestroke dvisvgm everysel \
    fontspec frcursive fundus-calligra gnu-freefont jknapltx latex-bin \
    mathastext microtype multitoc physics prelim2e preview ragged2e relsize rsfs \
    setspace standalone tipa wasy wasysym xcolor xetex xkeyval

# Setup Python venv and Manim with JupyterLab support
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip && pip install manim[jupyterlab]==0.19.0

# Node setup
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build


### Stage 2: Production
FROM node:20-bookworm

WORKDIR /usr/src/app

# Install runtime dependencies (matching official manimcommunity/manim image)
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    ffmpeg pkg-config libcairo2-dev libffi-dev libpango1.0-dev libjpeg-dev \
    freeglut3-dev ghostscript fonts-noto \
    && rm -rf /var/lib/apt/lists/*

# Update font cache
RUN fc-cache -fv

# Copy Manim venv and TeX Live from builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /usr/local/texlive /usr/local/texlive
ENV PATH="/opt/venv/bin:/usr/local/texlive/bin/armhf-linux:/usr/local/texlive/bin/aarch64-linux:/usr/local/texlive/bin/x86_64-linux:$PATH"

# Setup Node runtime
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy build output
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3001
CMD ["pnpm", "start"]

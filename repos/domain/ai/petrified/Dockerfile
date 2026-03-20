FROM node:20-alpine

# FFmpeg and Chromaprint (fpcalc) for audio fingerprinting.
RUN apk add --no-cache ffmpeg chromaprint

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@micro/petrified

WORKDIR /workspace/repos/domain/ai/petrified
COPY repos/domain/ai/petrified/.env .env
EXPOSE 7201

CMD ["node", "dist/main.js"]

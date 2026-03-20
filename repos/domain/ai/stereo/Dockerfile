FROM node:20-alpine

# Base image for stereo service runtime.
RUN apk add --no-cache ffmpeg chromaprint

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@micro/stereo

WORKDIR /workspace/repos/domain/ai/stereo
COPY repos/domain/ai/stereo/.env .env
EXPOSE 7203

CMD ["node", "dist/main.js"]

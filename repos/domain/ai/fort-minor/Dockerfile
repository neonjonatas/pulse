FROM node:20-alpine

# Runtime tools used by audio processing paths.
RUN apk add --no-cache ffmpeg chromaprint

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@micro/fort-minor

WORKDIR /workspace/repos/domain/ai/fort-minor
COPY repos/domain/ai/fort-minor/.env .env
EXPOSE 7202

CMD ["node", "dist/main.js"]

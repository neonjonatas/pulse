FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@micro/mockingbird

WORKDIR /workspace/repos/domain/streaming/mockingbird
COPY repos/domain/streaming/mockingbird/.env .env
EXPOSE 7200

CMD ["node", "dist/main.js"]

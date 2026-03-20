FROM node:20-alpine

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@micro/hybrid-storage

WORKDIR /workspace/repos/domain/streaming/hybrid-storage
COPY repos/domain/streaming/hybrid-storage/.env .env
EXPOSE 7300

CMD ["node", "dist/main.js"]

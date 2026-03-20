FROM node:20-alpine

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@micro/backstage

WORKDIR /workspace/repos/domain/realtime/backstage
COPY repos/domain/realtime/backstage/.env .env
EXPOSE 4001

CMD ["node", "dist/main.js"]

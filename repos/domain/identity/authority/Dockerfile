FROM node:20-alpine

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@micro/authority

WORKDIR /workspace/repos/domain/identity/authority
COPY repos/domain/identity/authority/.env .env
EXPOSE 7000

CMD ["node", "dist/main.js"]

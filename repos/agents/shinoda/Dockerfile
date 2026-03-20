FROM node:20-alpine

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY repos ./repos

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@agent/shinoda

WORKDIR /workspace/repos/agents/shinoda
COPY repos/agents/shinoda/.env .env
EXPOSE 4111

CMD ["pnpm", "start"]

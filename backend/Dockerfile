FROM node:24.18.0-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/api-contracts/package.json packages/api-contracts/package.json
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci
COPY packages/api-contracts packages/api-contracts
COPY backend backend
RUN npm run build -w @agentnexo/api-contracts && npm run build -w @agentnexo/backend
RUN npm prune --omit=dev

FROM node:24.18.0-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001 DB_PATH=/data/agentnexo.sqlite
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/api-contracts ./packages/api-contracts
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/dist ./backend/dist
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3001
CMD ["node", "backend/dist/index.js"]

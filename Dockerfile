FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/public/data ./public/data
COPY --from=builder /app/start.sh ./start.sh
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=${PORT:-3000}
EXPOSE ${PORT:-3000}
CMD ["./start.sh"]

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (this will build better-sqlite3)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Ponder types
RUN pnpm codegen || true

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache dumb-init wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ponder -u 1001

# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy built node_modules from builder (includes compiled better-sqlite3)
COPY --from=builder --chown=ponder:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --chown=ponder:nodejs . .

# Create .ponder directory for internal state
RUN mkdir -p .ponder && chown ponder:nodejs .ponder

# Switch to non-root user
USER ponder

# Expose GraphQL port
EXPOSE 42069

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:42069 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Ponder
CMD ["pnpm", "start"]

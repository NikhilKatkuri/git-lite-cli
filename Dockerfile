# Multi-stage build for testing GLC
FROM node:18-alpine AS base
RUN apk add --no-cache git
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the project
RUN pnpm run build

# Install globally for testing
RUN npm pack && npm install -g git-lite-cli-*.tgz

# Test stage
FROM base AS test
RUN mkdir /test && cd /test && \
    git init && \
    git config user.name "Test User" && \
    git config user.email "test@example.com" && \
    echo "# Test" > README.md && \
    glc save "Initial commit" && \
    glc status && \
    glc branch --list

# Production stage
FROM node:18-alpine AS production
RUN apk add --no-cache git
RUN npm install -g pnpm@9.0.0
COPY --from=base /usr/local/lib/node_modules/git-lite-cli /usr/local/lib/node_modules/git-lite-cli
RUN ln -s /usr/local/lib/node_modules/git-lite-cli/dist/index.js /usr/local/bin/glc
CMD ["glc", "--help"]
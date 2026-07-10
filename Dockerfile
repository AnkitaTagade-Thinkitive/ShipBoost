FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

COPY package.json package-lock.json* ./

# Install all dependencies (the build needs devDependencies such as vite, which
# is a peer dependency of @react-router/dev). NODE_ENV is set to production only
# after the build so `react-router build` has its build tooling available.
RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

ENV NODE_ENV=production

# docker-start runs `prisma generate && prisma migrate deploy` then starts the
# production server. DATABASE_URL and the Shopify credentials are provided as
# runtime environment variables by the host.
CMD ["npm", "run", "docker-start"]

# Construcción
FROM node:20-slim AS builder

WORKDIR /app

# Copiar configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Producción
FROM node:20-slim AS runner

WORKDIR /app

# Copiar archivos compilados y dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Variables de entorno por defecto
ENV SUPABASE_URL=""
ENV SUPABASE_SERVICE_ROLE_KEY=""
ENV DATABASE_URL=""

# Ejecutar usando stdio (por eso no exponemos puertos HTTP)
ENTRYPOINT ["node", "dist/index.js"]

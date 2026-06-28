FROM node:20-alpine AS server

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci -w server --omit=dev

COPY server ./server

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start", "-w", "server"]

FROM node:20-alpine AS client-build

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
RUN npm ci -w client

COPY client ./client

ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build -w client

FROM nginx:alpine AS client

COPY --from=client-build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
